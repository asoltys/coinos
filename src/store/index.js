import Vue from 'vue';
import Vuex from 'vuex';
import bech32 from 'bech32';
import bip21 from 'bip21';
import bolt11 from 'bolt11';
import router from '../router';
import validate from 'bitcoin-address-validation';
import { ECPair, payments, networks, Psbt } from 'bitcoinjs-lib';
import pathify, { make } from 'vuex-pathify';
import paths from '../paths';
import format from '../format';
Vue.use(Vuex);

const SATS = 100000000;

const methods = {
  bitcoin: 'BTC',
  liquid: 'LBTC',
  lightning: 'LNBTC',
};

const addressTypes = ['p2sh-segwit', 'legacy', 'bech32'];

pathify.options.mapping = 'simple';

const isLiquid = text =>
  text.startsWith('Az') ||
  text.startsWith('lq1') ||
  text.startsWith('VJL') ||
  text.startsWith('VT') ||
  text.startsWith('XR') ||
  ((text.startsWith('H') || text.startsWith('G')) && text.length === 34) ||
  (text.startsWith('ert1q') && text.length === 43) ||
  (text.startsWith('ex1q') && text.length === 42);

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
  method: null,
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
  ecpair: null,
  error: '',
  fiat: true,
  friends: [],
  invoice: JSON.parse(blankInvoice),
  invoices: [],
  initializing: false,
  loading: false,
  loadingFee: false,
  nodes: [],
  orders: [],
  payment: JSON.parse(blankPayment),
  payments: [],
  psbt: null,
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
          dispatch('setupSockets');
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

    async getAddress({ commit, getters, dispatch }) {},

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
        commit('error', e.response ? e.response.data : e.message);
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

    async loadPayments({ state }) {
      try {
        let res = await Vue.axios.get('/payments');
        state.user.payments = res.data;
      } catch(e) {
        commit('error', e.response ? e.response.data : e.message);
      } 
    },

    async setupSockets({ commit, getters, dispatch }) {
      const proto = process.env.NODE_ENV === 'production' ? 'wss://' : 'ws://';
      if (!getters.token) return;
      if (getters.socket) {
        if (getters.socket.readyState === 1) return;
        else {
          commit('socket', null);
        }
      }
      let ws = new WebSocket(`${proto}${location.host}/ws`);
      commit('socket', ws);

      ws.onopen = () => {
        ws.send(getters.token);
        commit('error', null);
      };

      ws.onerror = () => {
        commit('error', 'Problem connecting to server');
        ws.close();
      };

      ws.onclose = e => {
        ws = null;
        setTimeout(() => dispatch('setupSockets'), 100);
      };

      ws.onmessage = msg => {
        let { type, data } = JSON.parse(msg.data);

        switch (type) {
          case 'login':
            if (data) {
              commit('user', data);
            } else {
              dispatch('logout');
            }
            break;

          case 'nodes':
            commit('nodes', data);
            break;

          case 'account':
            commit('addAccount', data);
            break;

          case 'payment':
            let p = data;
            commit('received', p);

            let precision = 8;
            let unit;

            if (p.account) {
              precision = p.account.precision;
              unit = p.account.ticker;
            }

            if (!unit || unit === 'BTC') unit = getters.user.unit;
            if (unit === 'SAT') precision = 0;

            if (p.amount > 0)
              dispatch(
                'snack',
                `${p.confirmed ? 'Received' : 'Detected unconfirmed' } ${format(p.amount + p.tip, precision)} ${unit}`
              );
            commit('addPayment', p);
            break;

          case 'accounts':
            getters.user.accounts = data;
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
      let params = {};
      Object.keys(user).map(k => {
        if (['payments', 'account'].includes(k)) return;
        params[k] = user[k];
      }); 

      try {
        let res = await Vue.axios.post('/user', params);
        commit('user', res.data.user);
        if (res.data.token) commit('token', res.data.token);
        return true;
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
        return false;
      }
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
            commit('psbt', res.data.psbt);
          } catch (e) {
            commit('error', e.response ? e.response.data : e.message);
          }
        } else {
          try {
            let res = await Vue.axios.post('/bitcoin/fee', params);
            payment.feeRate = res.data.feeRate;
            payment.tx = res.data.tx;
          } catch (e) {
            commit('error', e.response ? e.response.data : e.message);
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
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async buildSweepTx({ commit, dispatch, getters }, address) {
      let { ecpair, payment, rate } = getters;
      let { address: target, amount, feeRate } = payment;
      commit('error', null);

      try {
        let res = await Vue.axios.post('/bitcoin/sweep', {
          address,
          amount,
          feeRate,
          target,
        });

        let { psbt, total } = res.data;
        psbt = Psbt.fromBase64(psbt)
          .signAllInputs(ecpair)
          .finalizeAllInputs();

        if (total) {
          payment.amount = total;
          payment.fiatAmount = ((total * rate) / SATS).toFixed(2);
        }

        payment.fee = psbt.getFee();
        payment.tx = psbt.extractTransaction();
        payment.tx.fee = payment.fee / SATS;
        payment.txid = payment.tx.txid;
        payment.feeRate = res.data.feeRate;

        commit('payment', payment);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async sweep({ commit, getters }) {
      let { payment, rate, user } = getters;
      let tx = payment.tx.toHex();
      try {
        await Vue.axios.post('/electrs/tx', tx);
        payment.account = user.accounts.find(a => a.asset === BTC);
        payment.sent = true;
        payment.rate = rate;
        payment.currency = user.currency;
        payment.amount += payment.fee;
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
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
          commit('error', e.response ? e.response.data : e.message);
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
            commit('error', e.response ? e.response.data : e.message);
          }
        } else {
          try {
            let res = await Vue.axios.post('/bitcoin/send', { address, tx });
            res.data.sent = true;
            commit('payment', res.data);
          } catch (e) {
            commit('error', e.response ? e.response.data : e.message);
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
      commit('error', null);
    },

    async clearPayment({ commit }) {
      let payment = JSON.parse(blankPayment);
      commit('payment', payment);
      commit('error', null);
    },

    async addInvoice({ commit, state }, method) {
      const { invoice, user } = state;

      if (!invoice.amount) invoice.amount = null;
      const { amount, tip } = invoice;

      method = method || invoice.method;
      invoice.method = method;
      invoice.network = methods[method];

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
            commit('error', e.response ? e.response.data : e.message);
          }
          break;
      }

      try {
        await Vue.axios.post(`/invoice`, { invoice });
        commit('invoice', invoice);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async paste({ commit, dispatch }) {
      go('/pasted');
    },

    async updateAccount({ commit, dispatch, state }, account) {
      try {
        await Vue.axios.post('/account', account);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
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
      let { nodes, payment, user } = getters;

      if (nodes.includes('lightning')) {
        try {
          if (text.slice(0, 10) === 'lightning:') text = text.slice(10);
          let payreq = text.toLowerCase();
          payment.payreq = payreq;
          payment.payobj = bolt11.decode(payment.payreq);
          let { coinType } = payment.payobj;

          if (process.env.NODE_ENV === 'production' && coinType !== 'bitcoin') {
            dispatch('clearPayment');
            commit(
              'error',
              `Wrong network, '${coinType}' instead of 'bitcoin'`
            );
            throw new Error();
          } else if (
            process.env.NODE_ENV !== 'production' &&
            coinType !== 'regtest'
          ) {
            dispatch('clearPayment');
            commit(
              'error',
              `Wrong network, '${coinType}' instead of 'regtest'`
            );
            throw new Error();
          }

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
        if (nodes.includes('bitcoin')) {
          url = bip21.decode(text);
          payment.network = 'BTC';
          url.options.asset = BTC;
        }
      } catch (e) {
        if (nodes.includes('liquid')) {
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

      if (nodes.includes('bitcoin') && validate(text)) {
        payment.address = text;
        payment.network = 'BTC';
        go({ name: 'send', params: { keep: true } });
        return;
      }

      // Liquid
      if (nodes.includes('liquid') && isLiquid(text)) {
        payment.address = text;
        payment.network = 'LBTC';
        go({ name: 'send', params: { keep: true } });
        return;
      }

      if (text.startsWith('6P')) {
        commit('text', text);
        return go('/decrypt');
      }

      try {
        const network =
          process.env.NODE_ENV === 'production'
            ? networks['bitcoin']
            : networks['regtest'];
        let ecpair = ECPair.fromWIF(text, network);
        commit('ecpair', ecpair);
        go('/sweep');
      } catch (e) {
        console.log(e.message);
      }
    },

    async generateBlock({ commit }, network) {
      Vue.axios.get(`/${network}/generate`);
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
    addAccount(s, v) {
      let index = s.user.accounts.findIndex(a => a.id === v.id);
      if (index > -1) s.user.accounts[index] = v;
      else s.user.accounts.unshift(v);
      if (s.user.account.id === v.id) s.user.account = v;
      s.user = JSON.parse(JSON.stringify(s.user));
    },
    addPayment(s, v) {
      s.invoice.received += parseInt(Math.abs(v.amount));
      if (s.invoice.received >= s.invoice.amount) {
        s.invoices.unshift(JSON.parse(JSON.stringify(s.invoice)));
        s.invoice.amount = 0;
        s.invoice.fiatAmount = 0;
      }

      let index = s.user.payments.findIndex(p => p.id === v.id);
      if (index > -1) s.user.payments[index] = v;
      else s.user.payments.unshift(v);

      s.user = JSON.parse(JSON.stringify(s.user));
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
      if (v && s.user) {
        if (v.account && v.account.ticker !== 'BTC') s.fiat = false;
        if (v.currencies && !Array.isArray(v.currencies))
          v.currencies = JSON.parse(v.currencies);
        Object.keys(v).map(k => (s.user[k] = v[k]));
        s.user = JSON.parse(JSON.stringify(s.user));
      } else {
        if (v) s.user = v;
        else s.user = {};
      } 
    },
  },
  getters: make.getters(state),
});
