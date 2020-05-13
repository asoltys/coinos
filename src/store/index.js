import Vue from 'vue';
import Vuex from 'vuex';
import bech32 from 'bech32';
import bip21 from 'bip21';
import bolt11 from 'bolt11';
import router from '../router';
import validate from 'bitcoin-address-validation';
import pathify, { make } from 'vuex-pathify';
import paths from '../paths';
import format from '../format';
Vue.use(Vuex);

const SATS = 100000000;

const networks = {
  bitcoin: 'BTC',
  liquid: 'LBTC',
  lightning: 'LNBTC',
};

const addressTypes = ['p2sh-segwit', 'legacy', 'bech32'];

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

const BTC = process.env.VUE_APP_LBTC;

const blankInvoice = JSON.stringify({
  amount: null,
  currency: '',
  fiatAmount: null,
  fiatTip: null,
  method: '',
  rate: 0,
  received: 0,
  text: '',
  tip: 0,
});

const state = {
  address: '',
  addressTypes,
  amount: null,
  asset: BTC,
  assets: [],
  channels: [],
  error: '',
  feeRate: null,
  fiat: true,
  fiatAmount: null,
  friends: [],
  invoice: JSON.parse(blankInvoice),
  invoices: [],
  initializing: false,
  loading: false,
  loadingFee: false,
  network: null,
  orders: [],
  payment: null,
  payments: [],
  payobj: null,
  payreq: '',
  pin: '',
  prompt2fa: false,
  rate: 0,
  rates: null,
  received: 0,
  recipient: null,
  route: null,
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
      commit('error', '');
      let token = window.sessionStorage.getItem('token');

      if (!token) {
        let cookie = `; ${document.cookie}`.match(';\\s*token=([^;]+)');
        if (cookie && cookie[1]) token = cookie[1];
      }

      if (token && token !== 'null') {
        commit('token', token);
        try {
          await dispatch('setupSockets');
        } catch(e) {
          l("failed to setup sockets");
        } 
      }

      let attempts = 0;
      const initialize = () => {
        attempts++;
        const { path } = router.currentRoute;

        if (getters.user && getters.user.currency && getters.rate) {
          if (path === '/') go('/home');
          commit('initializing', false);
          commit('loading', false);
        } else if (paths.includes(path)) {
          commit('initializing', false);
          commit('loading', false);
        } else if (attempts > 5) {
          go('/');
          commit('user', null);
          commit('initializing', false);
          commit('loading', false);
        } else {
          setTimeout(initialize, 500);
        }
      };

      initialize();

      try {
        commit('assets', (await Vue.axios.get('/assets')).data);
      } catch (e) {
        l(e);
        commit('error', 'Problem connecting to server');
      }
    },

    async login({ commit, dispatch, state }, user) {
      commit('user', user);
      user.token = state.twofa;
      try {
        let res = await Vue.axios.post('/login', user);

        commit('user', res.data.user);
        commit('token', res.data.token);
      } catch (e) {
        if (e.response && e.response.data.startsWith('2fa'))
          commit('prompt2fa', true);
        else commit('error', 'Login failed');
        return;
      }

      await dispatch('init');
      if (router.currentRoute.path !== '/home') go('/home');
    },

    async getNewAddress({ commit, dispatch, state }) {
      let type = state.addressTypes.shift();
      state.addressTypes.push(type);
      state.invoice.address = (await Vue.axios.post('/address', { type })).data;
      dispatch('addInvoice');
    },

    async getStats({ commit }) {
      commit('loading', true);
      try {
        const stats = (await Vue.axios.get('/info')).data;
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
      if (state.user.account.ticker !== 'BTC') return;
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
      if (state.socket) state.socket.close();
      commit('socket', null);
      go('/');
    },

    async loadPayments() {
      Vue.axios.get('/payments');
    },

    async setupSockets({ commit, getters, state, dispatch }) {
      if (state.socket) return;
      return new Promise((resolve, reject) => {
        const proto = process.env.NODE_ENV === "production" ? "wss://" : "ws://";
        const ws = new WebSocket(`${proto}${location.host}/ws`);

        ws.onopen = () => {
          ws.send(getters.token);
          commit('socket', ws);
          resolve();
        };

        ws.onerror = () => {
          commit('error', "Couldn't establish socket connection");
          reject();
        };

        ws.onmessage = (msg) => {
          let { type, data } = JSON.parse(msg.data);
          switch (type) {
            case 'to':
              commit('recipient', data);
              break;

            case 'payment':
              let p = data;
              commit('payment', p);

              let precision = p.account.precision;
              let unit = p.account.ticker;
              if (unit === 'BTC') unit = getters.user.unit;
              if (unit === 'SAT') precision = 0;

              if (p.amount > 0)
                dispatch(
                  'snack',
                  `Received ${format(
                    p.amount + p.tip,
                    precision
                  )} ${unit}`
                );
              commit('addPayment', p);
              break;

            case 'payments':
              commit('payments', data);
              break;

            case 'rates':
              const rates = data;
              if (!rates) return;
              commit('rates', rates);
              if (getters.user && getters.user.currency)
                commit('rate', rates[getters.user.currency]);
              break;

            case 'otpsecret':
              commit('user', { ...state.user, otpsecret: data });
              break;

            case 'user':
              commit('user', data);
              break;

            case 'login':
              let user = data;
              if (user) {
                commit('user', user);
                if (
                  router.currentRoute.path === '/login' ||
                  router.currentRoute.path === '/'
                ) {
                  go('/home');
                }
              } else {
                dispatch('logout');
              }
              resolve();
              break;
          }
        };
      });
    },

    async createUser({ commit, dispatch }, token) {
      let length = 8,
        charset =
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        username = 'Guest-';

      for (let i = 0, n = charset.length; i < length; ++i) {
        username += charset.charAt(Math.floor(Math.random() * n));
      }

      try {
        await Vue.axios.post('/register', { username, token });
        dispatch('login', { username });
      } catch (e) {
        commit('error', e);
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

      let { address, amount, feeRate, user } = getters;
      let { asset } = user.account;

      let params = { address, amount, asset, feeRate };

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

    async sendInternal({ commit, dispatch, getters }) {
      let {
        amount,
        recipient: { username },
        user,
      } = getters;
      let asset = user.account.asset;

      try {
        let res = await Vue.axios.post('/send', {
          amount,
          asset,
          username,
        });
        commit('payment', res.data);
      } catch (e) {
        commit('error', e.response.data);
      }
    },

    async sendPayment({ commit, dispatch, getters }) {
      commit('loading', true);
      commit('error', null);

      let { address, amount, asset, tx, payreq, route } = getters;

      if (payreq) {
        try {
          let res = await Vue.axios.post('/lightning/send', {
            amount,
            payreq,
            route,
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
            let res = await Vue.axios.post('/liquid/send', {
              address,
              asset,
              tx,
            });
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
      commit('tip', null);
      commit('tx', null);
      commit('loading', false);
      commit('payreq', '');
      commit('address', '');
      commit('payment', null);
      commit('payobj', null);
      commit('amount', null);
      commit('fiatAmount', null);
      commit('error', null);
      commit('route', null);
      commit('recipient', null);
    },

    async addInvoice({ commit, state }, method) {
      const { invoice, user } = state;

      if (!invoice.amount) invoice.amount = null;
      const { amount, tip } = invoice;

      method = method || invoice.method;
      invoice.method = method;
      invoice.network = networks[method];

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

          let text = url(address);
          text = text.replace('liquid', 'liquidnetwork');
          if (amount) text += `&asset=${user.account.asset}`;

          invoice.address = address;
          invoice.text = text;
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

    async updateAccount({ commit, dispatch, state }, account) {
      try {
        await Vue.axios.post('/account', account);
      } catch (e) {
        commit('error', e.response.data);
      }
    },

    async shiftAccount({ commit, dispatch, getters }, asset) {
      let { user } = getters;

      if (typeof asset !== 'string') {
        let index = user.accounts.findIndex(a => a.id === user.account.id);
        let current = user.accounts[index].asset;

        if (current === BTC) {
          await dispatch('toggleUnit');
          if (user.unit === 'SAT') return;
        }

        if (index >= user.accounts.length - 1) index = 0;
        else index++;

        asset = user.accounts[index].asset;
      }

      if (asset !== BTC && user.unit === 'SAT') dispatch('toggleUnit');
      await Vue.axios.post('/shiftAccount', { asset });
    },

    async handleScan({ commit, dispatch, getters }, text) {
      if (typeof text !== 'string') return router.go(-1);

      await dispatch('clearPayment');
      let { user } = getters;

      try {
        if (text.slice(0, 10) === 'lightning:') text = text.slice(10);
        let payreq = text.toLowerCase();
        let payobj = bolt11.decode(payreq);

        if (user.account.ticker !== 'BTC')
          await dispatch('shiftAccount', process.env.VUE_APP_LBTC);

        commit('amount', payobj.satoshis);
        commit(
          'fiatAmount',
          ((payobj.satoshis * getters.rate) / SATS).toFixed(2)
        );
        commit('network', 'lightning');
        commit('payobj', payobj);
        commit('payreq', payreq);

        await Vue.axios.post('/lightning/query', { payreq });

        go({ name: 'send', params: { keep: true } });
        return;
      } catch (e) {
        if (e.response) commit('error', e.response.data);
      }

      let url;
      try {
        url = bip21.decode(text);
        commit('network', 'bitcoin');
        url.options.asset = BTC;
      } catch (e) {
        try {
          url = bip21.decode(text, 'liquidnetwork');
          commit('network', 'liquid');
        } catch (e) {
          /**/
        }
      }

      if (url) {
        let account = user.accounts.find(a => a.asset === url.options.asset);
        if (account) await dispatch('shiftAccount', account.asset);
        else return commit('error', 'Unrecognized asset');

        commit('address', url.address);

        if (url.options.amount) {
          let amount = parseInt((url.options.amount * SATS).toFixed(0));
          commit('amount', amount);
          commit('fiatAmount', ((amount * getters.rate) / SATS).toFixed(2));
        }

        await dispatch('estimateFee');
        go({ name: 'send', params: { keep: true } });
        return;
      }

      if (validate(text)) {
        commit('address', text);
        commit('network', 'bitcoin');
        go({ name: 'send', params: { keep: true } });
        return;
      }

      // Liquid
      if (
        text.startsWith('Az') ||
        text.startsWith('lq1') ||
        text.startsWith('VJL') ||
        text.startsWith('VT')
      ) {
        commit('address', text);
        commit('network', 'liquid');
        go({ name: 'send', params: { keep: true } });
        return;
      }

      try {
        bech32.decode(text);
        commit('address', text);
        commit('network', 'bitcoin');
        go({ name: 'send', params: { keep: true } });
        return;
      } catch (e) {
        /**/
      }
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

      let index = s.payments.findIndex(p => p.id === v.id);
      if (index > -1) s.payments[index] = v;
      else s.payments.unshift(v);
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
      if (v) {
        if (v.account && v.account.ticker !== 'BTC') s.fiat = false;
        if (v.payments) s.payments = v.payments;
        if (v.currencies && !Array.isArray(v.currencies))
          v.currencies = JSON.parse(v.currencies);
      }
      s.user = v;
    },
  },
  getters: make.getters(state),
});
