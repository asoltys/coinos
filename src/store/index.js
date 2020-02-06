import socketio from 'socket.io-client';
import Vue from 'vue';
import Vuex from 'vuex';
import bech32 from 'bech32';
import bip21 from 'bip21';
import bolt11 from 'bolt11';
import router from '../router';
import { address as BitcoinAddress } from 'bitcoinjs-lib';
import pathify, { make } from 'vuex-pathify';
Vue.use(Vuex);

pathify.options.mapping = 'simple';
const generatePassword = () => {
  let length = 8,
    charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    retVal = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

const l = console.log;
const state = {
  address: '',
  amount: 0,
  channels: [],
  error: '',
  fees: 0,
  fiat: false,
  friends: [],
  initializing: false,
  loading: false,
  orders: [],
  payment: null,
  payments: [],
  payobj: null,
  payreq: '',
  payuser: '',
  pin: '',
  rate: 0,
  rates: null,
  received: 0,
  scan: '',
  scanning: false,
  scannedBalance: null,
  snack: '',
  socket: null,
  token: null,
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
    async init({ commit, dispatch, state }) {
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

      const publicpaths = ['/', '/login', '/about', '/register', '/forgot'];
      if (
        !(
          publicpaths.includes(router.currentRoute.path) ||
          (state.user && state.user.address)
        )
      ) {
        router.push('/');
      }

      commit('initializing', false);
    },

    async login({ commit, dispatch }, user) {
      try {
        let res = await Vue.axios.post('/login', user);

        commit('user', res.data.user);
        commit('token', res.data.token);
      } catch (e) {
        commit('error', 'Login failed');
        return;
      }

      await dispatch('init');
      router.push('/home');
    },

    async facebookLogin({ commit, dispatch }, data) {
      let { accessToken, userID } = data.authResponse;
      let res;

      switch (data.status) {
        case 'connected':
          res = await Vue.axios.post('/facebookLogin', { accessToken, userID });
          commit('user', res.data.user);
          commit('token', res.data.token);
          await dispatch('init');
          router.push('/home');
          break;
      }
    },

    async shiftCurrency({ commit, dispatch, state }) {
      const { user } = state;
      let { currencies } = user;
      if (!Array.isArray(currencies)) currencies = JSON.parse(user.currencies);
      let i = currencies.findIndex(c => c === user.currency) + 1;
      if (i === currencies.length) i = 0;
      user.currency = currencies[i];
      commit('rate', state.rates[user.currency]);
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
      router.push('/');
    },

    async forgot({ commit, state }, email) {
      Vue.axios.post(`/forgot`, email);
    },

    async verify({ dispatch }, data) {
      let res = await Vue.axios.get(`/verify/${data.email}/${data.token}`);
      if (res.data) dispatch('snack', 'Your email has been verified');
    },

    async buy({ state, dispatch }, { amount, token }) {
      try {
        let sat = ((100000000 * amount) / 100 / state.rate).toFixed(0);
        await Vue.axios.post('/buy', { amount, token, sat });
        router.push('/home');
        dispatch('snack', `Bought ${sat} satoshis`);
      } catch (e) {
        l('error charging credit card', e);
        return;
      }
    },

    async loadPayments() {
      Vue.axios.get('/payments');
    },

    async setupSockets({ commit, state, dispatch }) {
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

      s.on('invoice', data => {
        dispatch('snack', `Received ${data.value} satoshi`);
      });

      s.on('payment', p => commit('addPayment', p));
      s.on('payments', p => commit('payments', p));

      s.on('rates', rates => {
        if (!rates) return;
        commit('rates', rates);
        commit('rate', rates[state.user.currency]);
      });

      s.on('user', user => commit('user', user));

      return new Promise((resolve, reject) => {
        s.on('connected', () => {
          s.emit('getuser', {}, user => {
            if (user) {
              commit('user', user);
              if (
                router.currentRoute.path === '/login' ||
                router.currentRoute.path === '/'
              ) {
                router.push('/home');
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
      user.password = generatePassword();
      user.passconfirm = user.password;
      user.username = 'Guest-' + user.password;

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
        if (state.user.username !== user.username) dispatch('logout');
        else commit('user', res.data);
      } catch (e) {
        commit('error', e.response.data);
      }
    },

    async requestEmail(_, email) {
      await Vue.axios.post('/requestEmail', { email });
    },

    async requestPhone(_, phone) {
      await Vue.axios.post('/requestPhone', { phone });
    },

    async verifyEmail(_, params) {
      await Vue.axios.get(`/verifyEmail/${params.username}/${params.token}`);
    },

    async verifyPhone(_, params) {
      await Vue.axios.get(`/verifyPhone/${params.username}/${params.token}`);
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

    async getChannels({ commit }) {
      let res = await Vue.axios.get('/channels');

      commit('channels', res.data.channels);
    },

    async getPeers({ commit }) {
      let res = await Vue.axios.get('/peers');

      commit('peers', res.data.peers);
    },

    async sendPayment({ commit, getters }) {
      commit('loading', true);
      commit('error', null);

      let { address, amount, payreq, payuser } = getters;

      if (payreq) {
        try {
          let res = await Vue.axios.post('/sendPayment', { payreq });
          commit('payment', res.data);
        } catch (e) {
          commit('error', e.response.data);
        }
      } else if (payuser) {
        try {
          let res = await Vue.axios.post('/payUser', { payuser, amount });
          commit('payment', res.data);
        } catch (e) {
          commit('error', e.response.data);
          l(e);
        }
      } else if (address) {
        if (
          address.startsWith('Az') ||
          address.startsWith('lq1') ||
          address.startsWith('VJL') ||
          address.startsWith('VT')
        ) {
          try {
            let res = await Vue.axios.post('/sendLiquid', { address, amount });
            commit('payment', res.data);
          } catch (e) {
            commit('error', e.response.data);
          }
        } else {
          try {
            let res = await Vue.axios.post('/sendCoins', { address, amount });
            commit('payment', res.data);
          } catch (e) {
            commit('error', e.response.data);
          }
        }
      }

      commit('loading', false);
    },

    async clearPayment({ commit }) {
      commit('loading', false);
      commit('payreq', '');
      commit('address', '');
      commit('payment', null);
      commit('payobj', null);
      commit('payuser', null);
      commit('amount', 0);
      commit('error', null);
    },

    async addInvoice({ commit }, { amount, tip, address }) {
      let res;
      try {
        res = await Vue.axios.post('/addInvoice', { amount, tip, address });
        commit('payreq', res.data.payment_request);
      } catch (e) {
        commit('error', e.response.data);
      }
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

    async handleScan({ commit, dispatch }, text) {
      await dispatch('clearPayment');
      commit('scanning', false);

      try {
        if (text.slice(0, 10) === 'lightning:') text = text.slice(10);
        let payobj = bolt11.decode(text.toLowerCase());
        router.push({ name: 'send', params: { keep: true } });
        commit('payobj', payobj);
        commit('payreq', text);
        return;
      } catch (e) {
        /**/
      }

      let url, liquid;
      try {
        url = bip21.decode(text);
      } catch (e) {
        try {
          url = bip21.decode(text, 'liquid');
          liquid = true;
        } catch (e) {
          /**/
        }
      }

      if (url) {
        commit('address', url.address);

        if (url.options.amount)
          commit(
            'amount',
            parseInt((url.options.amount * 100000000).toFixed(0))
          );

        if (!liquid && process.env.NODE_ENV === 'production') {
          try {
            let res = await Vue.axios.get(`/balance/${url.address}`);
            commit('scannedBalance', res.data.final_balance);
          } catch (e) {
            /**/
          }
        }

        router.push({ name: 'send', params: { keep: true } });
        return;
      }

      try {
        BitcoinAddress.fromBase58Check(text);
        commit('address', text);
        if (!liquid && process.env.NODE_ENV === 'production') {
          try {
            let res = await Vue.axios.get(`/balance/${text}`);
            commit('scannedBalance', res.data.final_balance);
          } catch (e) {
            /**/
          }
        }
        router.push({ name: 'send', params: { keep: true } });
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
        router.push({ name: 'send', params: { keep: true } });
        return;
      }

      try {
        bech32.decode(text);
        commit('address', text);
        router.push({ name: 'send', params: { keep: true } });
        return;
      } catch (e) {
        /**/
      }
    },

    async snack({ commit }, msg) {
      commit('snack', msg);
    },
  },
  mutations: {
    ...make.mutations(state),
    addPayment(s, v) {
      s.amount = 0;
      s.received = parseInt(Math.abs(v.amount));
      s.payments.push(v);
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
