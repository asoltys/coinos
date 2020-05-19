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

const blankPayment = JSON.stringify({
  account: null,
  address: '',
  amount: null,
  asset: BTC,
  feeRate: null,
  fiatAmount: null,
  network: null,
  payment: null,
  payobj: null,
  payreq: '',
  recipient: null,
  route: null,
  sent: false,
  tip: null,
  tx: null,
});

const state = {
  addressTypes,
  asset: BTC,
  assets: [],
  challenge: '',
  channels: [],
  error: '',
  fiat: true,
  friends: [],
  invoice: JSON.parse(blankInvoice),
  invoices: [],
  initializing: false,
  loading: false,
  loadingFee: false,
  networks: [],
  orders: [],
  payment: JSON.parse(blankPayment),
  payments: [],
  pin: '',
  prompt2fa: false,
  rate: 0,
  rates: null,
  received: JSON.parse(blankPayment),
  stats: null,
  snack: '',
  socket: null,
  text: '',
  token: null,
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
      let token = getters.token || window.sessionStorage.getItem('token');

      if (!token) {
        let cookie = `; ${document.cookie}`.match(';\\s*token=([^;]+)');
        if (cookie && cookie[1]) token = cookie[1];
      }


      if (token && token !== 'null') {
        commit('token', token);
        try {
          await dispatch('setupSockets');
        } catch (e) {
          l('failed to setup sockets', e);
        }
      }

      let attempts = 0;
      const initialize = () => {
        attempts++;
        const { path } = router.currentRoute;

        if (getters.user && getters.user.currency && getters.rate) {
          if (path === '/' || path === '/register') go('/home');
          setTimeout(() => {
            commit('initializing', false);
            commit('loading', false);
          }, 200);
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

    async getChallenge({ commit, getters, dispatch }) {
      try {
        let res = await Vue.axios.get('/challenge');
        commit('challenge', res.data);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
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

    async setupSockets({ commit, getters, dispatch }) {
      return new Promise((resolve, reject) => {
        if (!getters.token) return reject();
        if (getters.socket && getters.socket.readyState === 1) return resolve();
        else if (!getters.socket) {
          const proto =
            process.env.NODE_ENV === 'production' ? 'wss://' : 'ws://';
          const ws = new WebSocket(`${proto}${location.host}/ws`);

          ws.onopen = () => {
            ws.send(getters.token);
            commit('error', null);
            commit('socket', ws);
            resolve();
          };

          ws.onerror = () => {
            commit('error', 'Problem connecting to server');
            commit('socket', null);
            ws.close();
            reject();
          };

          ws.onclose = (e) => {
            const poll = () => setTimeout(async () => {
              try {
                await dispatch('setupSockets');
              } catch(e) {
                if (getters.token) poll();
              } 
            } , 1000);
            poll();
          };

          ws.onmessage = msg => {
            let { type, data } = JSON.parse(msg.data);

            switch (type) {
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

              case 'networks':
                commit('networks', data);
                break;

              case 'payment':
                let p = data;
                commit('received', p);

                let precision = p.account.precision;
                let unit = p.account.ticker;
                if (unit === 'BTC') unit = getters.user.unit;
                if (unit === 'SAT') precision = 0;

                if (p.amount > 0)
                  dispatch(
                    'snack',
                    `Received ${format(p.amount + p.tip, precision)} ${unit}`
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

              case 'to':
                let { payment } = getters;
                payment.recipient = data;
                break;

              case 'user':
                commit('user', data);
                break;
            }
          };
        }
        else {
          getters.socket.close();
          commit('socket', null);
          setTimeout(() => dispatch('setupSockets'), 1000);
          reject();
        } 
      });
    },

    async issueAsset({ commit, dispatch }, asset) {
      try {
        await Vue.axios.post('/assets', asset);
        go('/assets');
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async createUser({ commit, dispatch }, user) {
      try {
        await Vue.axios.post('/register', { user });
        dispatch('login', user);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
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

      let { payment, user } = getters;
      let { asset } = user.account;
      let { address, amount, feeRate } = payment;

      let params = { address, amount, asset, feeRate };

      if (address) {
        if (isLiquid(address)) {
          try {
            let res = await Vue.axios.post('/liquid/fee', params);
            payment.feeRate = res.data.feeRate;
            payment.tx = res.data.tx;
          } catch (e) {
            commit('error', e.message);
          }
        } else {
          try {
            let res = await Vue.axios.post('/bitcoin/fee', params);
            payment.feeRate = res.data.feeRate;
            payment.tx = res.data.tx;
          } catch (e) {
            commit('error', e.response.data);
          }
        }
      }

      commit('loadingFee', false);
    },

    async sendInternal({ commit, dispatch, getters }) {
      let {
        payment: {
          amount,
          recipient: { username },
        },
        user,
      } = getters;
      let asset = user.account.asset;

      if (amount <= 0)
        return commit('error', 'Amount must be greater than zero');

      try {
        let res = await Vue.axios.post('/send', {
          amount,
          asset,
          username,
        });
        res.data.sent = true;
        commit('payment', res.data);
      } catch (e) {
        commit('error', e.response.data);
      }
    },

    async sendPayment({ commit, dispatch, getters }) {
      commit('loading', true);
      commit('error', null);

      let {
        payment: { address, amount, asset, tx, payreq, route },
      } = getters;

      if (payreq.startsWith('ln')) {
        try {
          let res = await Vue.axios.post('/lightning/send', {
            amount,
            payreq,
            route,
          });
          res.data.sent = true;
          commit('payment', res.data);
        } catch (e) {
          commit('error', e.response.data);
        }
      } else if (address) {
        if (!tx) await dispatch('estimateFee');
        tx = getters.payment.tx;
        if (!tx) return commit('loading', false);

        if (isLiquid(address)) {
          try {
            let res = await Vue.axios.post('/liquid/send', {
              address,
              asset,
              tx,
            });
            res.data.sent = true;
            commit('payment', res.data);
          } catch (e) {
            commit('error', e.response.data);
          }
        } else {
          try {
            let res = await Vue.axios.post('/bitcoin/send', { address, tx });
            res.data.sent = true;
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
      let payment = JSON.parse(blankPayment);
      commit('payment', payment);
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

    async getRecipient({ commit, dispatch, getters }, username) {
      try {
        let { payment } = getters;
        payment.recipient = (await Vue.axios.get(`/users/${username}`)).data;
        commit('error', null);
      } catch (e) {
        commit('error', 'User not found');
      }
    },

    async handleScan({ commit, dispatch, getters }, text) {
      if (!text) return;
      if (typeof text !== 'string') return router.go(-1);
      await dispatch('clearPayment');
      let { networks, payment, user } = getters;

      if (networks.includes('lightning')) {
        try {
          if (text.slice(0, 10) === 'lightning:') text = text.slice(10);
          let payreq = text.toLowerCase();
          payment.payreq = payreq;
          payment.payobj = bolt11.decode(payment.payreq);

          if (user.account.ticker !== 'BTC')
            await dispatch('shiftAccount', process.env.VUE_APP_LBTC);

          payment.amount = payment.payobj.satoshis;
          payment.fiatAmount = (
            (payment.payobj.satoshis * getters.rate) /
            SATS
          ).toFixed(2);
          payment.network = 'LNBTC';

          await Vue.axios.post('/lightning/query', { payreq });

          go({ name: 'send', params: { keep: true } });
          return;
        } catch (e) {
          if (e.response) commit('error', e.response.data);
        }
      }

      let url;
      try {
        if (networks.includes('bitcoin')) {
          url = bip21.decode(text);
          payment.network = 'BTC';
          url.options.asset = BTC;
        }
      } catch (e) {
        if (networks.includes('liquid')) {
          try {
            url = bip21.decode(text, 'liquidnetwork');
            payment.network = 'LBTC';
          } catch (e) {
            /**/
          }
        }
      }

      if (url) {
        let account = user.accounts.find(a => a.asset === url.options.asset);
        if (account) await dispatch('shiftAccount', account.asset);
        else return commit('error', 'Unrecognized asset');

        payment.address = url.address;

        if (url.options.amount) {
          payment.amount = parseInt((url.options.amount * SATS).toFixed(0));
          payment.fiatAmount = ((payment.amount * getters.rate) / SATS).toFixed(
            2
          );
        }

        await dispatch('estimateFee');
        go({ name: 'send', params: { keep: true } });
        return;
      }

      if (networks.includes('bitcoin') && validate(text)) {
        payment.address = text;
        payment.network = 'BTC';
        go({ name: 'send', params: { keep: true } });
        return;
      }

      // Liquid
      if (
        networks.includes('liquid') &&
        (text.startsWith('Az') ||
          text.startsWith('lq1') ||
          text.startsWith('VJL') ||
          text.startsWith('VT'))
      ) {
        payment.address = text;
        payment.network = 'LBTC';
        go({ name: 'send', params: { keep: true } });
        return;
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
