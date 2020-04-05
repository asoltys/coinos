import socketio from 'socket.io-client';
import Vue from 'vue';
import Vuex from 'vuex';
import bech32 from 'bech32';
import bip21 from 'bip21';
import bolt11 from 'bolt11';
import router from '../router';
import { address as BitcoinAddress } from 'bitcoinjs-lib';
import pathify, { make } from 'vuex-pathify';
import paths from '../paths';
Vue.use(Vuex);

const SATS = 100000000;

const assets = {
  bitcoin: 'BTC',
  liquid: 'LBTC',
  lightning: 'LNBTC',
};

pathify.options.mapping = 'simple';

const isLiquid = address =>
  address.startsWith('Az') ||
  address.startsWith('lq1') ||
  address.startsWith('VJL') ||
  address.startsWith('VT');

const l = console.log;
const go = path => {
  path === router.currentRoute.path ||
    path.name === router.currentRoute.path.substr(1) ||
    router.push(path);
};

const blankInvoice = JSON.stringify({
  amount: 0,
  currency: '',
  fiatAmount: 0,
  fiatTip: 0,
  method: '',
  rate: 0,
  received: 0,
  text: '',
  tip: 0,
});

const state = {
  address: '',
  addressType: 'bitcoin',
  amount: 0,
  channels: [],
  error: '',
  feeRate: null,
  fiat: true,
  fiatAmount: 0,
  friends: [],
  invoice: JSON.parse(blankInvoice),
  invoices: [],
  initializing: false,
  loading: false,
  loadingFee: false,
  orders: [],
  payment: null,
  payments: [],
  payobj: null,
  payreq: '',
  payuser: '',
  pin: '',
  prompt2fa: false,
  rate: 0,
  rates: null,
  received: 0,
  route: null,
  scan: '',
  scanning: false,
  scannedBalance: null,
  stats: null,
  snack: '',
  socket: null,
  text: '',
  tip: 0,
  token: null,
  tx: null,
  twofa: '',
  user: {
    address: null,
    balance: null,
    readonly: true,
  },
};

export default new Vuex.Store({
  plugins: [pathify.plugin],
  state,
  actions: {
    async init({ commit, getters, dispatch, state }) {
      commit('initializing', true);
      commit('scanning', false);
      commit('error', '');
      let token = window.sessionStorage.getItem('token');

      if (!token) {
        let cookie = `; ${document.cookie}`.match(';\\s*token=([^;]+)');
        if (cookie && cookie[1]) token = cookie[1];
      }

      if (token && token !== 'null') {
        commit('token', token);
        await dispatch('setupSockets');
      }

      let attempts = 0;
      const initialize = () => {
        attempts++;
        const { path } = router.currentRoute;

        console.log(attempts);

        if (
          (getters.user && getters.user.currency && getters.rate)
        ) {
          if (path === '/') go('/home');
          commit('initializing', false);
        } else if (paths.includes(path)) { 
          commit('initializing', false);
        } else if (attempts > 5) {
          go('/');
          commit('initializing', false);
        } else {
          setTimeout(initialize, 500);
        }
      };

      initialize();
    },

    async login({ commit, dispatch, state }, user) {
      commit('user', user);
      user.token = state.twofa;
      try {
        let res = await Vue.axios.post('/login', user);

        commit('user', res.data.user);
        commit('token', res.data.token);
      } catch (e) {
        if (e.response.data.startsWith('2fa')) commit('prompt2fa', true);
        else commit('error', 'Login failed');
        return;
      }

      await dispatch('init');
      if (router.currentRoute.path !== '/home') go('/home');
    },

    async facebookLogin({ commit, state, dispatch }, data) {
      let res;

      switch (data.status) {
        case 'connected':
          let user = data;
          user.authResponse.token = state.twofa;
          commit('user', user);

          try {
            res = await Vue.axios.post('/facebookLogin', user.authResponse);
            commit('user', res.data.user);
            commit('token', res.data.token);
            await dispatch('init');
            go('/home');
            break;
          } catch (e) {
            if (e.response.data.startsWith('2fa')) {
              commit('prompt2fa', true);
            }
          }
      }
    },

    async getStats({ commit }) {
      commit('loading', true);
      try {
        const stats = (await Vue.axios.get('/balances')).data;
        commit('stats', stats);
      } catch (e) {
        commit('error', e.response.data);
      }

      commit('loading', false);
    },

    async enable2fa(_, token) {
      const res = await Vue.axios.post('/2fa', { token });
    },

    async disable2fa(_, token) {
      const res = await Vue.axios.post('/disable2fa', { token });
    },

    async toggleUnit({ commit, dispatch, state }) {
      state.user.unit = state.user.unit === 'SAT' ? 'BTC' : 'SAT';
      dispatch('updateUser', state.user);
    },

    async shiftCurrency({ commit, dispatch, state }) {
      const { invoice, user } = state;
      let { currencies } = user;
      if (!Array.isArray(currencies)) currencies = JSON.parse(user.currencies);
      let i = currencies.findIndex(c => c === user.currency) + 1;
      if (i === currencies.length) i = 0;

      let currency = currencies[i];
      dispatch('setCurrency', currency);
    },

    async setCurrency({ commit, dispatch, getters, state }, currency) {
      const { invoice, rates, user } = state;
      if (!(user.currencies.includes(currency) && rates[currency])) return;
      const rate = rates[currency];

      user.currency = currency;
      invoice.currency = currency;
      invoice.rate = rate;
      invoice.fiatAmount = ((invoice.amount * rate) / SATS).toFixed(2);
      invoice.fiatTip = ((invoice.tip * rate) / SATS).toFixed(2);
      state.fiatAmount = ((state.amount * rate) / SATS).toFixed(2);

      commit('rate', rate);
      dispatch('updateUser', user);
    },

    async logout({ commit, state }) {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.sessionStorage.removeItem('token');
      commit('token', null);
      commit('pin', null);
      commit('user', null);
      if (state.socket) state.socket.disconnect();
      commit('socket', null);
      go('/');
    },

    async loadPayments() {
      Vue.axios.get('/payments');
    },

    async setupSockets({ commit, getters, state, dispatch }) {
      if (state.socket) return;
      let s = socketio(process.env.VUE_APP_SOCKETIO, {
        query: { token: state.token },
      });
      commit('socket', s);

      s.on('emailVerified', () => {
        dispatch('snack', 'Your email has been verified');
      });

      s.on('phoneVerified', () => {
        dispatch('snack', 'Your phone number has been verified');
      });

      s.on('payment', p => {
        if (p.amount > 0)
          dispatch('snack', `Received ${p.amount + p.tip} satoshi`);
        commit('addPayment', p);
      });

      s.on('payments', p => commit('payments', p));

      s.on('rates', rates => {
        if (!rates) return;
        commit('rates', rates);
        commit('rate', rates[state.user.currency]);
      });

      s.on('otpsecret', otpsecret =>
        commit('user', { ...state.user, otpsecret })
      );
      s.on('user', user => {
        commit('user', user);
      });

      return new Promise((resolve, reject) => {
        s.on('connected', () => {
          s.emit('getuser', {}, user => {
            if (user) {
              if (!Array.isArray(user.currencies))
                user.currencies = JSON.parse(user.currencies);
              commit('user', user);
              if (
                router.currentRoute.path === '/login' ||
                router.currentRoute.path === '/'
              ) {
                go('/home');
              }
            }
            resolve();
          });
        });

        s.on('connect_failed', reject);
        s.on('error', reject);
      });
    },

    async createUser({ commit, dispatch }, user = {}) {
      let length = 8,
        charset =
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        username = 'Guest-';

      for (let i = 0, n = charset.length; i < length; ++i) {
        username += charset.charAt(Math.floor(Math.random() * n));
      }

      user.username = username;

      try {
        await Vue.axios.post('/register', user);
        dispatch('login', user);
      } catch (e) {
        commit('error', e.response.data);
      }
    },

    async updateUser({ commit, dispatch, state }, user) {
      try {
        let res = await Vue.axios.post('/user', user);
        commit('user', res.data.user);
        if (res.data.token) commit('token', res.data.token);
        return true;
      } catch (e) {
        commit('error', e.response.data);
        return false;
      }
    },

    async getFriends({ commit }) {
      commit('loading', true);

      try {
        let res = await Vue.axios.get('/friends');
        commit('friends', res.data);
      } catch (e) {
        commit('error', e.response.data);
      }

      commit('loading', false);
    },

    async estimateFee({ commit, getters }) {
      commit('error', null);
      commit('loadingFee', true);

      let { address, amount, feeRate } = getters;

      let params = { address, amount, feeRate };

      if (address) {
        if (isLiquid(address)) {
          try {
            let res = await Vue.axios.post('/liquid/fee', params);
            commit('feeRate', res.data.feeRate);
            commit('tx', res.data.tx);
          } catch (e) {
            commit('error', e.response.data);
          }
        } else {
          try {
            let res = await Vue.axios.post('/bitcoin/fee', params);
            commit('feeRate', res.data.feeRate);
            commit('tx', res.data.tx);
          } catch (e) {
            commit('error', e.response.data);
          }
        }
      }

      commit('loadingFee', false);
    },

    async sendPayment({ commit, dispatch, getters }) {
      commit('loading', true);
      commit('error', null);

      let { address, amount, tx, payreq, payuser, route } = getters;

      if (payreq) {
        try {
          let res = await Vue.axios.post('/lightning/send', { payreq, route });
          commit('payment', res.data);
        } catch (e) {
          commit('error', e.response.data);
        }
      } else if (payuser) {
        try {
          let res = await Vue.axios.post('/lightning/user', {
            payuser,
            amount,
          });
          commit('payment', res.data);
        } catch (e) {
          commit('error', e.response.data);
        }
      } else if (address) {
        if (!tx) await dispatch('estimateFee');
        tx = getters.tx;
        if (!tx) return commit('loading', false);

        if (isLiquid(address)) {
          try {
            let res = await Vue.axios.post('/liquid/send', { address, tx });
            commit('payment', res.data);
          } catch (e) {
            commit('error', e.response.data);
          }
        } else {
          try {
            let res = await Vue.axios.post('/bitcoin/send', { address, tx });
            commit('payment', res.data);
          } catch (e) {
            commit('error', e.response.data);
          }
        }
      }

      commit('loading', false);
    },

    async clearInvoice({ commit, state }) {
      let invoice = JSON.parse(blankInvoice);
      invoice.currency = state.user.currency;
      invoice.rate = state.rate;
      commit('invoice', invoice);
    },

    async clearPayment({ commit }) {
      commit('feeRate', null);
      commit('tip', 0);
      commit('tx', null);
      commit('loading', false);
      commit('payreq', '');
      commit('address', '');
      commit('payment', null);
      commit('payobj', null);
      commit('payuser', null);
      commit('amount', 0);
      commit('error', null);
    },

    async addInvoice({ commit, state }, method) {
      const { invoice, user } = state;

      if (!invoice.amount) invoice.amount = null;
      const { amount, tip } = invoice;

      method = method || invoice.method;
      invoice.method = method;
      invoice.asset = assets[method];

      const url = address =>
        amount
          ? `${method}:${address}?amount=${((amount + tip) / SATS).toFixed(8)}`
          : address;

      let address;
      switch (method) {
        case 'bitcoin':
          ({ address } = user);
          invoice.address = address;
          invoice.text = url(address);
          break;
        case 'liquid':
          ({ confidential: address } = user);
          invoice.address = address;
          invoice.text = url(address);
          break;
        case 'lightning':
          try {
            let { data: text } = await Vue.axios.post(`/lightning/invoice`, {
              amount,
              tip,
            });
            invoice.text = text;
          } catch (e) {
            commit('error', e.response.data);
          }
          break;
      }

      try {
        await Vue.axios.post(`/invoice`, { invoice });
        commit('invoice', invoice);
      } catch (e) {
        commit('error', e.response.data);
      }
    },

    async paste({ commit, dispatch }) {
      go('/pasted');
    },

    async scan({ commit, dispatch }) {
      commit('scanning', true);

      if (window.QRScanner) {
        window.QRScanner.prepare(err => {
          if (err) {
            console.error(err);
            return;
          }

          window.QRScanner.show(() => {
            document.querySelector('#app').style.display = 'none';
            document.querySelector('#camcontrols').style.display = 'block';

            window.QRScanner.scan((err, res) => {
              if (err) {
                l(err);
              } else {
                dispatch('handleScan', res);
              }

              document.querySelector('#app').style.display = 'block';
              document.querySelector('#camcontrols').style.display = 'none';

              window.QRScanner.destroy();
            });
          });
        });
      }
    },

    async handleScan({ commit, dispatch, getters }, text) {
      await dispatch('clearPayment');
      commit('scanning', false);
      let { tx } = getters;

      try {
        if (text.slice(0, 10) === 'lightning:') text = text.slice(10);
        let payreq = text.toLowerCase();
        let payobj = bolt11.decode(payreq);
        let res = await Vue.axios.post('/lightning/query', { payreq });
        if (res.data.routes.length) commit('route', res.data.routes[0]);
        go({ name: 'send', params: { keep: true } });
        commit('payobj', payobj);
        commit('payreq', text);
        return;
      } catch (e) {
        /**/
      }

      let url;
      try {
        url = bip21.decode(text);
        commit('addressType', 'bitcoin');
      } catch (e) {
        try {
          url = bip21.decode(text, 'liquid');
          commit('addressType', 'liquid');
        } catch (e) {
          /**/
        }
      }

      if (url) {
        commit('address', url.address);

        if (url.options.amount) {
          let amount = parseInt((url.options.amount * SATS).toFixed(0));
          commit('amount', amount);
          commit('fiatAmount', ((amount * getters.rate) / SATS).toFixed(2));
        }

        if (!tx) await dispatch('estimateFee');
        go({ name: 'send', params: { keep: true } });
        return;
      }

      try {
        BitcoinAddress.fromBase58Check(text);
        commit('address', text);
        commit('addressType', 'bitcoin');
        go({ name: 'send', params: { keep: true } });
        return;
      } catch (e) {
        /**/
      }

      // Liquid
      if (
        text.startsWith('Az') ||
        text.startsWith('lq1') ||
        text.startsWith('VJL') ||
        text.startsWith('VT')
      ) {
        commit('address', text);
        commit('addressType', 'liquid');
        go({ name: 'send', params: { keep: true } });
        return;
      }

      try {
        bech32.decode(text);
        commit('address', text);
        commit('addressType', 'bitcoin');
        go({ name: 'send', params: { keep: true } });
        return;
      } catch (e) {
        /**/
      }

      dispatch('showText', text);
    },

    async showText({ commit }, text) {
      commit('text', text);
      go('/text');
    },

    async snack({ commit }, msg) {
      commit('snack', msg);
    },
  },
  mutations: {
    ...make.mutations(state),
    addPayment(s, v) {
      s.invoice.received += parseInt(Math.abs(v.amount));
      if (s.invoice.received >= s.invoice.amount) {
        s.invoices.unshift(JSON.parse(JSON.stringify(s.invoice)));
        s.invoice.amount = 0;
        s.invoice.fiatAmount = 0;
      }
      s.payments.unshift(v);
    },
    error(s, v) {
      s.error = v;
      if (v && v.toString().includes('502 Bad'))
        s.error = 'Problem connecting to server';
    },
    token(s, v) {
      window.sessionStorage.setItem('token', v);
      Vue.axios.defaults.headers.common = { Authorization: `bearer ${v}` };
      s.token = v;
    },
    user(s, v) {
      if (v && v.payments) s.payments = v.payments;
      s.user = v;
    },
  },
  getters: make.getters(state),
});
