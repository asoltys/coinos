import Vue from 'vue';
import Vuex from 'vuex';
import bech32 from 'bech32';
import bip21 from 'bip21';
import { fromSeed, fromBase58 } from 'bip32';
import bolt11 from 'bolt11';
import router from '../router';
import validate from 'bitcoin-address-validation';
import { crypto, ECPair, payments, Psbt } from 'bitcoinjs-lib';
import {
  crypto as lqcrypto,
  ECPair as lqECPair,
  payments as lqpayments,
  Psbt as lqPsbt,
} from 'liquidjs-lib';
import pathify, { make } from 'vuex-pathify';
import restrictedPaths from '../restrictedPaths';
import publicPaths from '../publicPaths';
import format from '../format';
import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import cryptojs from 'crypto-js';
import sha256, { HMAC } from 'fast-sha256';
import secp256k1 from 'secp256k1';
import { validate as isUuid, v4 } from 'uuid';
import { fromSeed as slip77FromSeed } from 'slip77';

const {
  AES: aes,
  enc: { Utf8 },
} = cryptojs;

const expectedType = process.env.VUE_APP_COINTYPE;

const getRoot = (privkey, seed, dispatch, user, password, network) => {
  let root;
  if (privkey) {
    privkey = aes.decrypt(privkey, password).toString(Utf8);
    root = fromBase58(privkey, network);
  } else {
    seed = aes.decrypt(seed, password).toString(Utf8);
    root = fromSeed(mnemonicToSeedSync(seed), network);
    user.account.privkey = aes.encrypt(root.toBase58(), password).toString();
    dispatch('updateAccount', user.account);
  }
  return root;
};

const linkingKey = (domain, seed) => {
  const root = fromSeed(mnemonicToSeedSync(seed));
  const hashingKey = root.derivePath("m/138'/0");
  const hmac = new HMAC(hashingKey.privateKey);
  const derivationMaterial = hmac.update(stringToUint8Array(domain)).digest();
  const first4 = derivationMaterial.slice(0, 4);
  return root.derivePath(
    `m/138'/${first4[0]}/${first4[1]}/${first4[2]}/${first4[3]}`
  );
};

const stringToUint8Array = str => {
  return Uint8Array.from(str, x => x.charCodeAt(0));
};

const hexToUint8Array = hexString => {
  return new Uint8Array(
    hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
  );
};

const bytesToHexString = bytes => {
  return bytes.reduce(function(memo, i) {
    return memo + ('0' + i.toString(16)).slice(-2); //padd with leading 0 if <16
  }, '');
};

Vue.use(Vuex);

const SATS = 100000000;

pathify.options.mapping = 'simple';

const isLiquid = text =>
  text.startsWith('Az') ||
  text.startsWith('lq1') ||
  text.startsWith('VJL') ||
  text.startsWith('VT') ||
  text.startsWith('XR') ||
  text.startsWith('XC') ||
  ((text.startsWith('H') || text.startsWith('G') || text.startsWith('Q')) &&
    text.length === 34) ||
  (text.startsWith('ert1q') && text.length === 43) ||
  (text.startsWith('ex1q') && text.length === 42) ||
  text.startsWith('el1qq') ||
  text.startsWith('lq1qq');

const l = console.log;
const go = path => {
  path === router.currentRoute.path ||
    path.name === router.currentRoute.path.substr(1) ||
    router.push(path);
};

const BTC = process.env.VUE_APP_LBTC;
const LCAD = process.env.VUE_APP_LCAD;

const blankUser = {
  username: null,
  currencies: ['AUD', 'CAD', 'GBP', 'EUR', 'JPY', 'USD'],
  currency: 'USD',
  accounts: [{ asset: BTC, ticker: 'BTC', precision: 8 }],
  account: { asset: BTC, ticker: 'BTC', precision: 8 },
  unit: 'SAT',
  fiat: false,
};

const blankInvoice = JSON.stringify({
  address: null,
  addressType: 'bech32',
  amount: null,
  currency: '',
  fiatAmount: null,
  fiatTip: null,
  memo: null,
  network: null,
  rate: 0,
  received: 0,
  user: JSON.parse(JSON.stringify(blankUser)),
  text: '',
  tip: null,
});

const blankPayment = JSON.stringify({
  account: null,
  address: '',
  amount: null,
  asset: BTC,
  feeRate: null,
  fiatAmount: null,
  memo: null,
  method: null,
  network: null,
  payment: null,
  payobj: null,
  payreq: '',
  recipient: null,
  replaceable: false,
  route: null,
  sent: false,
  tip: null,
  tx: null,
});

const state = {
  inverse: false,
  type: 'sell',
  a1: BTC,
  a2: LCAD,
  addressType: 'bech32',
  asset: BTC,
  assets: {},
  balances: null,
  challenge: '',
  channels: [],
  channelRequest: null,
  deposit: false,
  fullscreen: false,
  hideControls: false,
  readController: null,
  writeController: null,
  ecpair: null,
  error: '',
  friends: [],
  fx: null,
  info: null,
  invoice: JSON.parse(blankInvoice),
  invoices: [],
  initializing: true,
  loading: false,
  loadingFee: false,
  lnurl: null,
  memo: null,
  network: null,
  paymentCount: 0,
  pin: '',
  nfcEnabled: false,
  nodes: [],
  noNfc: false,
  orders: [],
  password: null,
  payment: JSON.parse(blankPayment),
  payments: [],
  order: null,
  orders: [],
  psbt: null,
  pin: '',
  poll: null,
  prompt2fa: false,
  promptPassword: false,
  promptPin: false,
  rate: 0,
  rates: null,
  received: JSON.parse(blankPayment),
  reader: null,
  seed: null,
  selected: null,
  snack: '',
  socket: null,
  stopScanning: false,
  subscription: null,
  text: '',
  token: null,
  twofa: '',
  recipient: JSON.parse(JSON.stringify(blankUser)),
  user: JSON.parse(JSON.stringify(blankUser)),
  success: null,
  versionMismatch: null,
  version: null,
};

export default new Vuex.Store({
  plugins: [pathify.plugin],
  state,
  actions: {
    async init({ commit, getters, dispatch, state }) {
      commit('error', null);

      let { token } = router.currentRoute.query;
      if (!token) ({ token } = getters);
      if (!token) token = window.sessionStorage.getItem('token');

      if (!token) {
        let cookie = `; ${document.cookie}`.match(';\\s*token=([^;]+)');
        if (cookie && cookie[1] && cookie[1] !== 'null') token = cookie[1];
      }

      let password = window.sessionStorage.getItem('password');
      if (password) commit('password', password);

      if (token === 'null') token = null;

      commit('token', token);

      const { path } = router.currentRoute;

      if (
        !(
          publicPaths.includes(path) ||
          (getters.socket && getters.socket.readyState === 1)
        )
      ) {
        try {
          const socketPoll = async () => {
            try {
              await dispatch('setupSocket');
            } catch (e) {
              // console.log("rejected setup", e);
            }

            commit('poll', setTimeout(socketPoll, 5000));
          };
          socketPoll();
        } catch (e) {
          dispatch('logout');
        }
      }

      commit('initializing', false);
      commit('loading', false);

      if (!(path === '/login' || path === '/register')) dispatch('getInfo');
      if (token) {
        if (['/', '/register'].includes(path)) return go('/home');
      } else if (restrictedPaths.includes(path)) return go('/login');
    },

    async checkPassword({ commit, getters, dispatch }, password) {
      try {
        const { data: match } = await Vue.axios.post('/password', { password });
        if (match) {
          const seed = aes.decrypt(getters.user.seed, password).toString(Utf8);
          commit('password', password);
          commit('seed', seed);
          return true;
        }

        return false;
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async getAssets({ commit, getters, dispatch }) {
      try {
        const { data: assets } = await Vue.axios.get('/assets');
        commit('assets', assets);
      } catch (e) {
        l(e);
        commit('error', 'Problem fetching assets');
      }
    },

    async getBalances({ commit, getters, dispatch }) {
      if (getters.balances) return;
      commit('loading', true);
      try {
        const { data: balances } = await Vue.axios.get('/balances');
        commit('balances', balances);
      } catch (e) {
        l(e);
        commit('error', 'Problem fetching balances');
      }
      commit('loading', false);
    },

    async getInfo({ commit, getters, dispatch }) {
      try {
        let info = (await Vue.axios.get('/info')).data;
        commit('info', info);
        commit('nodes', info.nodes);
        commit('fx', info.fx);
        commit('version', info.clientVersion.trim());
      } catch (e) {
        l(e);
        commit('error', 'Problem getting server info');
      }
    },

    async accept({ commit, getters, dispatch }, { id, text }) {
      try {
        let { data: acceptance } = await Vue.axios.post('/accept', {
          id,
          text,
        });
        dispatch('snack', 'Swap completed');
        go('/swaps');
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async createOrder({ commit, getters, dispatch }, order) {
      try {
        await Vue.axios.post('/orders', order);
      } catch (e) {
        commit('error', e.response ? e.response.data.toString() : e.message);
      }
    },

    async deleteOrder({ commit, state, dispatch }, id) {
      const { orders } = state;
      try {
        await Vue.axios.delete(`/order/${id}`);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async propose({ commit, getters, dispatch }, params) {
      try {
        let { data: order } = await Vue.axios.post('/propose', params);
        return order;
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async getOrders({ commit, getters, dispatch }) {
      commit('error', null);
      try {
        const { data: orders } = await Vue.axios.get('/orders');
        commit('orders', orders);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async publish({ commit, getters, dispatch }) {
      const { order } = getters;

      try {
        await Vue.axios.post('/publish', { id: order.id });
        go('/swaps');
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
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
      commit('loading', true);
      commit('user', user);
      user.token = state.twofa;
      const { password } = user;

      try {
        let res = await Vue.axios.post('/taboggan', user);
        let seed, token;

        ({ token, user } = res.data);
        commit('user', user);
        commit('token', token);

        if (user.seed) {
          seed = aes.decrypt(user.seed, password).toString(Utf8);
        } else {
          seed = generateMnemonic();
          user.seed = aes.encrypt(seed, password).toString();
        }

        commit('password', password);
        commit('seed', seed);

        if (!user.keys.length) {
          const key = bytesToHexString(
            secp256k1.publicKeyCreate(
              linkingKey(window.location.hostname, seed).privateKey,
              true
            )
          );
          dispatch('addLinkingKey', key);
        }

        dispatch('updateUser', user);
        if (router.currentRoute.path === '/login') go('/home');
      } catch (e) {
        if (e.response && e.response.data.startsWith('2fa'))
          commit('prompt2fa', true);
        else commit('error', 'Login failed');
        commit('loading', false);
        l(e.message);
        return;
      }

      if (state.socket) state.socket.close();
      await dispatch('init');
    },

    async deleteAccount({ commit, dispatch, getters }, { id }) {
      try {
        if (getters.user.account.id === id)
          throw new Error("Can't delete account while in use");
        await Vue.axios.post('/accounts/delete', { id });
        getters.user.accounts.splice(
          getters.user.accounts.findIndex(a => a.id === id),
          1
        );
        go('/wallets');
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async createAccount(
      { commit, dispatch, getters },
      { type, name, ticker, precision, seed, path, pubkey, privkey, network }
    ) {
      if (!getters.password) await dispatch('passwordPrompt');
      const { password, user } = getters;
      if (seed) seed = aes.encrypt(seed, password).toString();
      if (privkey) privkey = aes.encrypt(privkey, password).toString();

      try {
        await Vue.axios.post('/accounts', {
          seed,
          privkey,
          pubkey,
          path,
          name,
          ticker,
          precision,
          network,
        });

        go('/home');
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async addLinkingKey({}, key) {
      const res = await Vue.axios.post('/keys', { key });
    },

    async pinPrompt({ commit, dispatch, getters }, resolve) {
      if (!getters.user.pin) return true;

      commit('promptPin', true);

      let interval;

      let ok = await new Promise((resolve, reject) => {
        interval = setInterval(() => {
          if (getters.pin === getters.user.pin) resolve(true) && l('resolved');
        }, 1000);
      });

      clearInterval(interval);
      commit('promptPin', false);
      commit('pin', null);

      return ok;
    },

    async passwordPrompt({ commit, dispatch, getters }, resolve) {
      commit('promptPassword', true);

      let interval;

      await new Promise((resolve, reject) => {
        interval = setInterval(() => {
          if (getters.password) resolve() && l('resolved');
        }, 1000);
      });

      clearInterval(interval);
      commit('promptPassword', false);

      const { seed, password } = getters;
      return { seed, password };
    },

    async uploadId({ commit, dispatch, state }, id) {
      const formData = new FormData();
      formData.append('id', id);
      try {
        await Vue.axios.post('/id', formData);
        return true;
      } catch (e) {
        return false;
      }
    },

    async createFunding({ commit, dispatch, state }, funding) {
      try {
        let { data: result } = await Vue.axios.post('/funding', funding);
        return result;
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async getWithdrawUrl({ commit, dispatch, getters }, { min, max }) {
      const { payment } = getters;
      try {
        const { data: withdrawUrl } = await Vue.axios.get(
          `/withdraw?min=${min}&max=${max}`
        );

        return withdrawUrl;
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async createWithdrawal({ commit, dispatch, state }, withdrawal) {
      try {
        await Vue.axios.post('/withdrawal', withdrawal);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async uploadProof({ commit, dispatch, state }, proof) {
      const formData = new FormData();
      formData.append('proof', proof);
      try {
        await Vue.axios.post('/proof', formData);
        return true;
      } catch (e) {
        return false;
      }
    },

    async getNewAddress({ commit, dispatch, state }, type) {
      let { invoice, password, recipient } = state;
      let { addressType, network, user } = invoice;

      if (!['bitcoin', 'liquid'].includes(network))
        commit('error', 'Invalid network');
      let address, confidentialAddress;

      let { index, pubkey, privkey, id, seed, path } = user.account;

      if (pubkey) {
        if (!password) ({ password } = await dispatch('passwordPrompt'));

        const root = getRoot(
          privkey,
          seed,
          dispatch,
          user,
          password,
          this._vm.$network
        );
        const parts = invoice.path.split('/');
        const hd = root.derive(parseInt(parts[parts.length - 1]));

        let type = {
          bech32: 'p2wpkh',
          'p2sh-segwit': 'p2sh',
          legacy: 'p2pkh',
        }[addressType];

        let p, n;
        if (network === 'bitcoin') {
          p = payments;
          n = this._vm.$network;
        } else {
          p = lqpayments;
          n = this._vm.$lqnetwork;
          type = 'p2sh';
        }

        if (type !== 'p2sh') {
          ({ address } = p[type]({
            pubkey: hd.publicKey,
            network: n,
          }));
        } else {
          if (network === 'liquid') {
            const p2wpkh = p.p2wpkh({
              pubkey: hd.publicKey,
              network: n,
            });
            const nodeBlinding = slip77FromSeed(seed);
            const blindingKeyPair = nodeBlinding.derive(p2wpkh.output);
            ({ address, confidentialAddress } = p[type]({
              redeem: p2wpkh,
              network: n,
              blindkey: blindingKeyPair.publicKey,
            }));

            if (confidentialAddress) {
              state.invoice.blindkey = blindingKeyPair.privateKey.toString(
                'hex'
              );
            }
          } else {
            ({ address } = p[type]({
              redeem: p.p2wpkh({
                pubkey: hd.publicKey,
                network: n,
              }),
              network: n,
            }));
          }
        }

        index++;
        await Vue.axios.post('/account', { id, address, index });
      } else {
        ({
          data: { address, confidentialAddress },
        } = await Vue.axios.get(
          `/address?network=${network}&type=${addressType}`
        ));
      }

      state.invoice.unconfidential = address;
      state.invoice.address = confidentialAddress || address;
      return state.invoice.address;
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
      user.fiat = true;
      if (user.currency === currency) return;
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
      commit('error', null);
      commit('lnurl', null);
      commit('loading', true);
      clearTimeout(state.poll);
      commit('poll', null);
      let { subscription } = state;

      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.sessionStorage.removeItem('password');
      window.sessionStorage.removeItem('token');
      commit('token', null);
      commit('pin', null);
      commit('user', null);
      if (state.socket) state.socket.close();
      commit('seed', null);
      commit('socket', null);
      commit('subscription', null);
      go('/login');
      commit('loading', false);

      try {
        await Vue.axios.post('/logout', { subscription });
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async loadPayments({ state }) {
      try {
        let res = await Vue.axios.get('/payments');
        state.user.payments = res.data;
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async setupNotifications({ commit, getters, dispatch }) {
      if (!('Notification' in window && process.env.VUE_APP_VAPID_PUBKEY)) {
        return;
      } else if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready
          .then(function(registration) {
            return registration.pushManager
              .getSubscription()
              .then(async function(subscription) {
                if (subscription) {
                  return subscription;
                }

                function urlBase64ToUint8Array(base64String) {
                  const padding = '='.repeat(
                    (4 - (base64String.length % 4)) % 4
                  );
                  const base64 = (base64String + padding)
                    .replace(/-/g, '+')
                    .replace(/_/g, '/');

                  const rawData = window.atob(base64);
                  const outputArray = new Uint8Array(rawData.length);

                  for (let i = 0; i < rawData.length; ++i) {
                    outputArray[i] = rawData.charCodeAt(i);
                  }
                  return outputArray;
                }

                const applicationServerKey = urlBase64ToUint8Array(
                  process.env.VUE_APP_VAPID_PUBKEY
                );

                return registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey,
                });
              });
          })
          .then(function(subscription) {
            Vue.axios.post('/subscribe', { subscription });
            commit('subscription', subscription);
          });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(() =>
          dispatch('setupNotifications')
        );
      }
    },

    async startScanning({ commit, getters, dispatch }) {
      const { reader } = getters;
      try {
        await reader.scan();
        commit('nfcEnabled', true);
      } catch (e) {
        commit('noNfc', true);
        commit('error', 'Failed to enable NFC');
      }
    },

    async setupNfc({ commit, getters, dispatch }) {
      if ('NDEFReader' in window) {
        const reader = new NDEFReader();
        const controller = new AbortController();
        const signal = controller.signal;
        commit('reader', reader);
        commit('readController', controller);

        reader.onreading = event => {
          event.message.records.map(async r => {
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(r.data);
            const parsed = await dispatch('handleScan', text);
            if (parsed === 'no') dispatch('showText', text);
          });
        };

        const permissionStatus = await navigator.permissions.query({
          name: 'nfc',
        });

        if (permissionStatus.state === 'granted') {
          dispatch('startScanning');
        }
      }
    },

    async setupSocket({ commit, getters, dispatch }) {
      return new Promise((resolve, reject) => {
        let timeout = setTimeout(() => reject(new Error('Socket timeout')), 5000);
        const proto = location.protocol === 'https:' ? 'wss://' : 'ws://';

        const open = () => {
          clearTimeout(timeout);
          const { socket: ws, recipient, user, token } = getters;
          if (ws) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));

            if (token && (!user || (!user.payments && !recipient.username))) {
              ws.send(JSON.stringify({ type: 'login', data: token }));
            } else {
              resolve();
              return true;
            }
          }

          return false;
        };

        if (open()) return;
        getters.user.payments = null;

        let ws = new WebSocket(`${proto}${location.host}/ws`);
        commit('socket', ws);

        ws.onopen = () => {
          open();
        };

        ws.onerror = e => {
          ws.close();
          reject(new Error('socket error' + e.message));
        };

        ws.onclose = async e => {
          ws = null;
          commit('socket', null);
          reject(new Error('socket closed'));
        };

        ws.onmessage = async msg => {
          commit('socket', ws);
          let { type, data } = JSON.parse(msg.data);

          let handlers = {
            connected() {
              getters.socket.id = data;
            },

            account() {
              commit('addAccount', data);
            },

            accounts() {
              getters.user.accounts = data;
            },

            key() {
              commit('addKey', data);
            },

            locked() {
              commit('snack', 'Account is locked');
            },

            login() {
              let user = data;
              if (user) {
                if (getters.password) {
                  let seed;
                  if (user.seed) {
                    try {
                      seed = aes
                        .decrypt(user.seed, getters.password)
                        .toString(Utf8);
                    } catch (e) {
                      dispatch('logout');
                    }
                  } else {
                    seed = generateMnemonic();
                    user.seed = aes.encrypt(seed, getters.password).toString();
                    dispatch('updateUser', user);
                  }
                  commit('seed', seed);
                }
                commit('user', user);

                resolve();
              } else {
                dispatch('logout');
              }
            },

            logout() {
              dispatch('logout');
            },

            otpsecret() {
              commit('user', { ...state.user, otpsecret: data });
            },

            async payment() {
              const { path } = router.currentRoute;

              if (path.includes('asset') && getters.fullscreen) {
                commit('snack', 'Payment received!');
                commit('deposit', false);
                commit('fullscreen', false);
                return;
              }

              if (
                (data.amount > 0 && path.includes('receive')) ||
                path.includes('faucet') ||
                path.includes('send')
              ) {
                if (data.amount > 0) commit('snack', 'Payment received!');
                else commit('snack', 'Payment sent!');

                if (
                  !getters.user.accounts.find(a => a.id === data.account_id)
                ) {
                  await new Promise(r => setTimeout(r, 1000));
                }
                if (data.account_id !== getters.user.account.id) {
                  await dispatch('shiftAccount', data.account_id);
                  if (getters.user.unit === 'SAT') await dispatch('toggleUnit');
                }
                await go('/home');
              }
              commit('addPayment', data);
              commit('selected', 0);
            },

            order() {
              commit('addOrder', data);
            },

            removeOrder() {
              commit('removeOrder', data);
            },

            rate() {
              const rate = data;
              const rates = {};
              const { fx, user } = getters;
              if (!fx || !rate || !user.currencies) return;

              user.currencies.map(symbol => {
                rates[symbol] = rate * fx[symbol];
              });

              commit('rates', rates);
              if (user && user.currency) commit('rate', rates[user.currency]);
            },

            to() {
              if (!getters.user.account.pubkey)
                getters.payment.recipient = data;
              commit('payment', JSON.parse(JSON.stringify(getters.payment)));
            },

            user() {
              commit('user', data);
            },

            version() {
              commit('version', data.trim());
            },
          };
          handlers[type]();
        };
      });
    },

    async issueAsset({ commit, dispatch, state }, asset) {
      commit('loading', true);
      try {
        await Vue.axios.post('/assets', asset);
        go('/wallets');
      } catch (e) {
        commit('loading', false);
        
        if (e.response && e.response.data.includes('Insufficient')) {
          dispatch('snack', 'Deposit funds to cover the issuance fee');
          let amount = parseFloat(e.response.data.split(' ')[6] * 100000000);
          state.invoice.amount = amount;
          state.invoice.fiatAmount = ((amount * state.rate) / SATS).toFixed(2);
          commit('hideControls', true);
          commit('deposit', true);
          commit('fullscreen', true);
          return;
        }
        commit('error', e.response ? e.response.data : e.message);
      }
      commit('loading', false);
    },

    async registerAsset({ commit, dispatch }, asset) {
      try {
        await Vue.axios.post('/assets/register', { asset });
        dispatch('snack', 'Successfully registered asset');
        go('/wallets');
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async createUser({ commit, dispatch }, user) {
      commit('error', null);
      commit('loading', true);
      try {
        let { data } = await Vue.axios.post('/register', { user });
        return data;
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
      commit('loading', false);
    },

    async reencryptAccountSeeds({ commit, dispatch, state }, newPassword) {
      let { password, user } = state;
      let seeds = {};
      user.accounts.map(a => {
        if (a.pubkey) {
          a.seed = aes
            .encrypt(aes.decrypt(a.seed, password).toString(Utf8), newPassword)
            .toString();
          seeds[a.id] = a.seed;
        }
      });

      try {
        await Vue.axios.post('/updateSeeds', { seeds });
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

      let { seed } = state;

      if (user.password && user.password === user.confirm) {
        if (!seed) ({ seed } = await dispatch('passwordPrompt'));
        params.seed = aes.encrypt(seed, user.password).toString();
        dispatch('reencryptAccountSeeds', user.password);
      }

      if (user.id) {
        try {
          let res = await Vue.axios.post('/user', params);
          commit('user', res.data.user);
          commit('seed', seed);
          if (params.password) commit('password', params.password);
          if (res.data.token) commit('token', res.data.token);
          return true;
        } catch (e) {
          commit('error', e.response ? e.response.data : e.message);
          return false;
        }
      }
    },

    async isInternal({ commit, dispatch, getters }) {
      try {
        let { address } = getters.payment;
        if (!address) return;
        await Vue.axios.get(`/isInternal?address=${address}`);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
        return false;
      }
    },

    async estimateFee({ commit, dispatch, getters }) {
      commit('error', null);
      commit('loadingFee', true);

      let { payment, password, user, seed } = getters;
      let { asset, privkey } = user.account;
      let { address, amount, feeRate, replaceable } = payment;

      let params = { address, amount, asset, feeRate, replaceable };

      if (address) {
        try {
          let network = isLiquid(address) ? 'liquid' : 'bitcoin';
          let { data } = await Vue.axios.post(`/${network}/fee`, params);

          if (!data.feeRate) {
            commit('loadingFee', false);
            return;
          }
          let { feeRate, tx } = data;

          payment.feeRate = feeRate;
          payment.tx = tx;

          if (user.account.pubkey) {
            commit('psbt', tx);
            if (!seed) ({ password, seed } = await dispatch('passwordPrompt'));
            let psbt, network;

            if (user.account.ticker === 'LBTC') {
              psbt = lqPsbt.fromBase64(tx);
              network = this._vm.$lqnetwork;
            } else {
              psbt = Psbt.fromBase64(tx);
              network = this._vm.$network;
            }

            const root = getRoot(
              privkey,
              seed,
              dispatch,
              user,
              password,
              this._vm.$network
            );

            psbt.data.inputs.map((input, inputIndex) => {
              for (let i = user.account.index; i >= 0; i--) {
                const hd = root.derive(i);

                const pair = ECPair.fromPrivateKey(hd.privateKey, {
                  compressed: true,
                  network,
                });

                try {
                  psbt.signInput(inputIndex, pair);
                } catch (e) {
                  /* */
                }
              }
            });

            await psbt.finalizeAllInputs();

            payment.fee = psbt.getFee();
            payment.tx = psbt.extractTransaction();
            payment.tx.fee = payment.fee / SATS;
            payment.txid = payment.tx.txid;
            payment.feeRate = feeRate;
            payment.signed = true;
          } else {
            payment.fee = Math.round(tx.fee * SATS);
          }

          commit('payment', JSON.parse(JSON.stringify(payment)));
        } catch (e) {
          commit('error', e.response ? e.response.data : e.message);
        }
      }

      commit('loadingFee', false);
    },

    async getPayment({ commit, dispatch, getters, state }, redeemcode) {
      try {
        let { data: payment } = await Vue.axios.get(`/payment/${redeemcode}`);
        commit('payment', payment);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async sendInternal({ commit, dispatch, getters, state }) {
      commit('error', null);
      let {
        payment: {
          amount,
          network,
          memo,
          recipient: { username },
        },
        user,
      } = getters;
      let asset = user.account.asset;

      if (!(await dispatch('pinPrompt'))) {
        commit('error', 'Invalid pin');
      }

      try {
        if (amount <= 0) {
          throw new Error('Amount must be greater than zero');
        }

        let { data: payment } = await Vue.axios.post('/send', {
          amount,
          asset,
          memo,
          username,
        });
        payment.sent = true;
        commit('payment', payment);
        if (payment.redeemcode) go(`/redeem/${payment.redeemcode}`);
      } catch (e) {
        await dispatch('clearPayment');
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async redeem({ commit, dispatch, getters }, redeemcode) {
      commit('loading', true);
      try {
        let {
          data: { user, payment },
        } = await Vue.axios.post('/redeem', {
          redeemcode,
        });

        if (user) {
          await dispatch('login', user);
          ({
            data: { payment },
          } = await Vue.axios.post('/redeem', {
            redeemcode,
          }));
        }

        await dispatch('shiftAccount', payment.account.id);
        go('/home');
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
      commit('loading', false);
    },

    async updatePayment({ commit, dispatch, getters }, { id, memo }) {
      const { socket } = getters;
      socket.send(JSON.stringify({ type: 'updateMemo', data: { id, memo } }));
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
        payment.hex = payment.tx.toHex();
        payment.txid = payment.tx.txid;
        payment.feeRate = res.data.feeRate;

        commit('payment', JSON.parse(JSON.stringify(payment)));
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async sweep({ commit, getters }) {
      let { payment, rate, user } = getters;
      try {
        await Vue.axios.post('/electrs/tx', payment.hex);
        payment.account = user.accounts.find(a => a.asset === BTC);
        payment.sent = true;
        payment.rate = rate;
        payment.currency = user.currency;
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async sendPayment({ commit, dispatch, getters }) {
      if (!(await dispatch('pinPrompt'))) {
        return commit('error', 'Invalid pin');
      }

      commit('loading', true);
      commit('error', null);

      let {
        payment: {
          address,
          amount,
          asset,
          network,
          memo,
          tx,
          payreq,
          replaceable,
          route,
          signed,
        },
      } = getters;

      if (signed) {
        try {
          let { data: payment } = await Vue.axios.post(
            `/${network}/broadcast`,
            {
              tx: tx.toHex(),
              payment: getters.payment,
            }
          );
          payment.sent = true;
          commit('payment', payment);
        } catch (e) {
          commit('error', e.response ? e.response.data : e.message);
        }

        commit('loading', false);
        return;
      }

      if (payreq.startsWith('lnbc')) {
        try {
          let { data: payment } = await Vue.axios.post('/lightning/send', {
            amount,
            memo,
            payreq,
            route,
          });
          payment.sent = true;
          commit('payment', payment);
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
              memo,
              tx,
            });
            res.data.sent = true;
            commit('payment', res.data);
          } catch (e) {
            commit('error', e.response ? e.response.data : e.message);
          }
        } else {
          try {
            let res = await Vue.axios.post('/bitcoin/send', {
              address,
              memo,
              tx,
            });
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
      commit('lnurl', null);
      commit('received', null);
    },

    async clearPayment({ commit }) {
      let payment = JSON.parse(blankPayment);
      commit('payment', payment);
      commit('error', null);
      commit('lnurl', null);
    },

    async checkUser({ commit, dispatch, state }, username) {
      try {
        let { data: exists } = await Vue.axios.get(
          `/exists?username=${username}`
        );
        return exists;
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async getFaucet({ commit, dispatch, state }, asset) {
      try {
        let { data } = await Vue.axios.get(`/faucet?asset=${asset}`);
        return data;
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async loadFaucet({ commit, dispatch, state }, asset) {
      const { amount } = state.payment;
      try {
        await Vue.axios.post(`/loadFaucet`, {
          amount,
          asset,
        });
        commit('snack', `Faucet loaded with ${amount} SAT`);
        commit('error', null);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async addInvoice({ commit, dispatch, state }, params) {
      commit('loading', true);
      const { controller, invoice, rate, recipient, network, socket } = state;
      if (recipient.username) invoice.user = recipient;
      else if (!(invoice.user && invoice.user.id)) invoice.user = state.user;
      const { user } = invoice;
      if (!invoice.path)
        invoice.path = `${user.account.path}/${user.account.index}`;
      if (!invoice.currency) invoice.currency = user.currency;

      if (!invoice.network) {
        if (user.account.pubkey) invoice.network = user.account.network;
        else
          invoice.network =
            network || (user.account.asset === BTC ? 'lightning' : 'liquid');
      }

      commit('network', invoice.network);

      if (controller) controller.abort();

      if (!invoice.amount) invoice.amount = null;
      const { amount, memo, tip } = invoice;

      if (!invoice.rate) invoice.rate = rate;

      invoice.address = null;
      invoice.received = 0;
      invoice.uuid = v4();

      const url = address => {
        let url = amount || memo ? `${invoice.network}:${address}?` : address;
        if (amount)
          url += `amount=${((amount + tip) / SATS).toFixed(8)}${
            memo ? '&' : ''
          }`;
        if (memo) url += `message=${memo}`;
        return url;
      };

      let address;
      switch (invoice.network) {
        case 'bitcoin':
          invoice.address = await dispatch('getNewAddress', invoice.type);
          invoice.text = url(invoice.address);
          break;
        case 'liquid':
          invoice.address = await dispatch('getNewAddress');
          let text = url(invoice.address);
          text = text.replace('liquid', 'liquidnetwork');
          if (amount) text += `&asset=${user.account.asset}`;
          invoice.text = text;
          break;
        case 'lightning':
          try {
            let { data: text } = await Vue.axios.post(`/lightning/invoice`, {
              amount,
              memo,
              tip,
            });
            invoice.text = text;
          } catch (e) {
            commit('error', e.response ? e.response.data : e.message);
          }
          break;
      }

      try {
        let { id, account_id, username } = user;
        let { data } = await Vue.axios.post(`/invoice`, {
          invoice,
          user: { id, account_id, username },
        });
        socket.send(JSON.stringify({ type: 'subscribe', data }));
        commit('invoice', invoice);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }

      dispatch('write', invoice.uuid);
      commit('loading', false);
    },

    async write({ commit, dispatch }, text) {
      if ('NDEFWriter' in window) {
        const controller = new AbortController();
        const signal = controller.signal;
        commit('writeController', controller);

        const writer = new NDEFWriter();

        try {
          await writer.write(text, { signal });
          dispatch('snack', 'Successfully wrote to NFC tag');
        } catch (e) {
          /* */
        }
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

    async shiftAccount({ commit, dispatch, getters }, id) {
      try {
        let { user } = getters;
        let account = user.accounts.find(a => a.id === id);

        if (!account) return;
        let { asset } = account;

        if (user.id) {
          await Vue.axios.post('/shiftAccount', { id });
          if (user.unit === 'SAT' && asset !== BTC)
            await dispatch('toggleUnit');
        } else {
          let ticker = asset === BTC ? 'BTC' : asset.substr(0, 3);
          user.account = { asset, ticker };
        }
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
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

    async generateChannelRequest({ commit }, { localAmt, pushAmt }) {
      try {
        const { data: lnurl } = await Vue.axios.post(
          '/lightning/channelRequest',
          {
            localAmt,
            pushAmt,
          }
        );
        commit('channelRequest', lnurl);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async handleScan({ commit, dispatch, getters }, text) {
      commit('stopScanning', false);

      if (!text) return;
      if (typeof text !== 'string') return router.go(-1);
      await dispatch('clearPayment');
      let { nodes, networks, payment, user } = getters;

      if (nodes.includes('lightning')) {
        try {
          if (text.toLowerCase().slice(0, 10) === 'lightning:')
            text = text.slice(10);
          let payreq = text.toLowerCase();
          payment.payreq = payreq;
          payment.payobj = bolt11.decode(payment.payreq);
          let { coinType } = payment.payobj;

          if (!networks.includes('lightning'))
            return commit('error', 'Lightning not supported in this account');

          if (coinType !== expectedType) {
            dispatch('clearPayment');
            commit(
              'error',
              `Wrong network, '${coinType}' instead of '${expectedType}'`
            );
            throw new Error('Wrong network');
          }

          if (user.account.ticker !== 'BTC')
            await dispatch(
              'shiftAccount',
              user.accounts.find(a => a.asset === BTC).id
            );

          let { tags, satoshis, millisatoshis } = payment.payobj;
          let description = tags.find(t => t.tagName === 'description');
          if (description) payment.memo = description.data;
          payment.amount = millisatoshis
            ? Math.round(millisatoshis / 1000)
            : satoshis;
          payment.fiatAmount = ((payment.amount * getters.rate) / SATS).toFixed(
            2
          );
          payment.network = 'lightning';

          await Vue.axios.post('/lightning/query', { payreq });
          if (!getters.payment.recipient)
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
          if (!networks.includes('bitcoin'))
            return commit('error', 'Bitcoin not supported in this account');
          payment.network = 'bitcoin';
          url.options.asset = BTC;
        }
      } catch (e) {
        if (nodes.includes('liquid')) {
          try {
            url = bip21.decode(text, 'liquidnetwork');
            if (!networks.includes('liquid'))
              return commit('error', 'Liquid not supported in this account');
            payment.network = 'liquid';
          } catch (e) {
            /**/
          }
        }
      }

      if (url) {
        let { amount, asset, assetid, message } = url.options;
        if (assetid) asset = assetid;
        if (!asset) asset = BTC;
        let account = user.accounts.find(a => a.asset === asset);
        if (account) {
          if (account.asset !== user.account.asset)
            await dispatch('shiftAccount', account.id);
        } else return commit('error', 'Unrecognized asset');

        payment.address = url.address;

        if (message) payment.memo = message;

        if (amount) {
          payment.amount = parseInt((amount * SATS).toFixed(0));
          payment.fiatAmount = ((payment.amount * getters.rate) / SATS).toFixed(
            2
          );
        }

        await dispatch('isInternal');
        await dispatch('estimateFee');
        go({ name: 'send', params: { keep: true } });
        return;
      }

      if (nodes.includes('bitcoin') && validate(text)) {
        if (!networks.includes('bitcoin'))
          return commit('error', 'Bitcoin not supported in this account');
        payment.address = text;
        payment.network = 'bitcoin';
        await dispatch('isInternal');
        go({ name: 'send', params: { keep: true } });
        return;
      }

      // Liquid
      if (nodes.includes('liquid') && isLiquid(text)) {
        if (!networks.includes('liquid'))
          return commit('error', 'Liquid not supported in this account');
        payment.address = text;
        payment.network = 'liquid';
        await dispatch('isInternal');
        go({ name: 'send', params: { keep: true } });
        return;
      }

      if (text.startsWith('6P')) {
        commit('text', text);
        return go('/decrypt');
      }

      try {
        let ecpair = ECPair.fromWIF(text, this._vm.$network);
        commit('ecpair', ecpair);
        go('/sweep');
      } catch (e) {
        /* */
      }

      if (text.toLowerCase().startsWith('lnurl:')) {
        try {
          const { data: lnurl } = await Vue.axios.get(`/url?code=${text}`);
          await dispatch('handleScan', lnurl);
          return;
        } catch (e) {
          commit('error', e.response ? e.response.data : e.message);
        }
      }

      if (text.toLowerCase().includes('lnurl')) {
        commit('loading', true);
        let txt = text.toLowerCase().match(/lnurl[a-z0-9]+/);

        try {
          const { data: params } = await Vue.axios.get(`/decode?text=${txt}`);
          if (params.status === 'ERROR') {
            let { reason } = params;
            try {
              ({ reason } = JSON.parse(reason.replace(/.*{/, '{')));
            } catch {
              /**/
            }

            commit('loading', false);
            return commit('error', reason);
          }

          let { seed } = getters;

          switch (params.tag) {
            case 'channelRequest':
              await dispatch('openChannel', params);
              break;
            case 'login':
              if (!seed) ({ seed } = await dispatch('passwordPrompt'));
              try {
                const key = linkingKey(params.domain, seed);
                const signedMessage = secp256k1.ecdsaSign(
                  hexToUint8Array(params.k1),
                  key.privateKey
                );
                const signedMessageDER = secp256k1.signatureExport(
                  signedMessage.signature
                );
                const linkingKeyPub = secp256k1.publicKeyCreate(
                  key.privateKey,
                  true
                );
                const sig = bytesToHexString(signedMessageDER);

                const response = await Vue.axios.post('/taboggan', {
                  params,
                  sig,
                  key: bytesToHexString(linkingKeyPub),
                });

                if (response.data.status === 'OK') {
                  commit('snack', 'Login success');
                } else {
                  commit('error', response.status);
                }

                go('/home');
              } catch (e) {
                commit('error', e.response ? e.response.data : e.message);
              }
              break;

            case 'withdrawRequest':
              commit('lnurl', params);
              go('/withdraw');
              break;
            case 'payRequest':
              commit('lnurl', params);
              go('/pay');
              break;
          }
        } catch (e) {
          commit('error', e.response ? e.response.data : e.message);
        }

        commit('loading', false);
      }

      if (isUuid(text)) {
        try {
          const { data: payment } = await Vue.axios.post('/checkRedeemCode', {
            redeemcode: text,
          });

          if (payment) {
            window.location.href = `${window.location.protocol}//${window.location.host}/redeem/${text}`;
            return;
          }
        } catch (e) {
          commit('error', e.response ? e.response.data : e.message);
        }

        try {
          const { data: invoice } = await Vue.axios.get(
            `/invoice?uuid=${text}`
          );
          await dispatch('handleScan', invoice.text);
          return;
        } catch (e) {
          commit('error', e.response ? e.response.data : e.message);
        }
      }

      if (
        text.startsWith(
          `${window.location.protocol}//${window.location.host}/redeem`
        )
      ) {
        window.location.href = text;
      }

      commit('stopScanning', true);

      return 'no';
    },

    async toggleFiat({ commit, dispatch, getters }) {
      getters.user.fiat = !getters.user.fiat;
      dispatch('updateUser', getters.user);
    },

    async pay({ commit, getters }, { amount, comment }) {
      commit('loading', true);
      const { lnurl: params } = getters;

      try {
        await Vue.axios.post('/pay', { amount, comment, params });
        go('/');
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }

      commit('loading', false);
    },

    async withdraw({ commit, getters }, amount) {
      commit('loading', true);
      const { lnurl: params } = getters;

      try {
        await Vue.axios.post('/withdraw', { amount, params });
        go('/');
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }

      commit('loading', false);
    },

    async getPaymentUrl({ commit, getters }) {
      commit('loading', true);
      try {
        const { invoice, socket, user } = getters;
        let {
          amount,
          user: { username },
        } = invoice;

        if (!username) ({ username } = user);

        const { data: lnurl } = await Vue.axios.get(
          `/pay/${username}?amount=${amount}`
        );

        socket.send(JSON.stringify({ type: 'subscribe', data: invoice }));
        commit('lnurl', lnurl);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
      commit('loading', false);
    },

    async getWithdrawUrl({ commit, dispatch, getters }, { min, max }) {
      const { payment } = getters;
      try {
        const { data: withdrawUrl } = await Vue.axios.get(
          `/withdraw?min=${min}&max=${max}`
        );

        return withdrawUrl;
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async createCode({ commit, dispatch }, lnurl) {
      if (!lnurl) return;
      try {
        const { data: code } = await Vue.axios.post('/code', { lnurl });
        dispatch('write', code.code);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async lnurlAuth({ commit, getters }) {
      const { user } = getters;
      let url = '/login';
      if (user.username) url += `?username=${user.username}`;

      let lnurl;
      try {
        ({ data: lnurl } = await Vue.axios.get(url));
        commit('lnurl', lnurl);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }

      try {
        const proto = location.protocol === 'https:' ? 'wss://' : 'ws://';
        const ws = new WebSocket(`${proto}${location.host}/ws`);
        ws.onmessage = msg => {
          let { type, data } = JSON.parse(msg.data);

          switch (type) {
            case 'connected':
              ws.send(JSON.stringify({ type: 'lnurl', data: lnurl.secret }));
              break;

            case 'token':
              let { token, key } = data;
              commit('password', key), commit('token', token);
              window.sessionStorage.setItem('password', key);
              ws.close();
              go('/home');
              break;
          }
        };
      } catch (e) {
        console.log('socket error', e);
      }
    },

    async deleteLinkingKey({}, hex) {
      Vue.axios.post('/keys/delete', { hex });
    },

    async openChannel({ commit, getters }, params) {
      try {
        let channelResult = await Vue.axios.post('/lightning/channel', {
          params,
        });
        if (channelResult.data.status === 'OK') {
          commit('snack', 'Open channel request submitted successfully');
        } else {
          throw new Error();
        }
      } catch (e) {
        commit('error', 'Failed to open channel');
      }
      go('/');
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
    addOrder(s, v) {
      let index = s.orders.findIndex(p => p.id === v.id);
      if (index > -1) s.orders[index] = v;
      else s.orders.unshift(v);
      s.orders = JSON.parse(JSON.stringify(s.orders));
    },
    removeOrder(s, v) {
      let index = s.orders.findIndex(p => p.id === parseInt(v));
      if (index > -1) {
        s.orders.splice(index, 1);
      }
    },
    addAccount(s, v) {
      let index = s.user.accounts.findIndex(a => a.id === v.id);
      if (index > -1) s.user.accounts[index] = v;
      else s.user.accounts.unshift(v);
      if (!s.user.account || s.user.account.id === v.id) s.user.account = v;
      if (s.assets) s.assets[v.asset] = v;
      s.user.accounts.sort((a, b) =>
        a.name === b.name
          ? a.balance < b.balance
            ? 1
            : -1
          : ('' + a.name).localeCompare(b.name)
      );
      s.user = JSON.parse(JSON.stringify(s.user));
    },
    addKey(s, v) {
      let index = s.user.keys.findIndex(a => a.id === v.id);
      if (index > -1) s.user.keys[index] = v;
      else s.user.keys.unshift(v);
      s.user = JSON.parse(JSON.stringify(s.user));
    },
    addPayment(s, v) {
      if (!s.user.payments) return;

      if (v.amount > 0) {
        s.received = v;
        s.invoice.received += parseInt(Math.abs(v.amount));
      }

      if (s.invoice.received >= s.invoice.amount) {
        s.invoices.unshift(JSON.parse(JSON.stringify(s.invoice)));
      }

      if (v.user_id === s.user.id) {
        let index = s.user.payments.findIndex(p => p.id === v.id);
        if (index > -1) s.user.payments[index] = v;
        else s.user.payments.unshift(v);

        s.user = JSON.parse(JSON.stringify(s.user));
      }

      s.paymentCount = s.user.payments.length;
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
        if (v.accounts)
          v.accounts.sort((a, b) =>
            a.name === b.name
              ? a.balance < b.balance
                ? 1
                : -1
              : ('' + a.name).localeCompare(b.name)
          );
        if (v.currencies && !Array.isArray(v.currencies))
          v.currencies = JSON.parse(v.currencies);
        Object.keys(v).map(k => (s.user[k] = v[k]));
        s.user = JSON.parse(JSON.stringify(s.user));
      } else {
        if (v) s.user = JSON.parse(JSON.stringify(v));
        else s.user = JSON.parse(JSON.stringify({}));
      }
    },
    version(s, v) {
      let version = process.env.VUE_APP_VERSION.trim();
      if (v !== version)
        s.versionMismatch = `Server expects ${v}, currently running ${version}`;
    },
  },
  getters: {
    ...make.getters(state),
    networks(s) {
      return s.nodes.filter(
        n =>
          (!s.user.account.pubkey &&
            (s.user.account.asset === process.env.VUE_APP_LBTC ||
              n === 'liquid')) ||
          s.user.account.network === n
      );
    },
  },
});
