import Vue from 'vue';
import Vuex from 'vuex';
import bech32 from 'bech32';
import bip21 from 'bip21';
import { fromSeed } from 'bip32';
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
import { generateMnemonic } from 'bip39';
import cryptojs from 'crypto-js';
import sha256, { HMAC } from 'fast-sha256';
import secp256k1 from 'secp256k1';
import { validate as isUuid, v4 } from 'uuid';

const {
  AES: aes,
  enc: { Utf8 },
} = cryptojs;

const expectedType = process.env.VUE_APP_COINTYPE;

const linkingKey = (domain, seed) => {
  const root = fromSeed(Buffer.from(sha256(seed), 'hex'));
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

const blankUser = {
  username: null,
  currencies: ['AUD', 'CAD', 'GBP', 'EUR', 'JPY', 'USD'],
  currency: 'USD',
  accounts: [{ asset: BTC, ticker: 'BTC', precision: 8 }],
  account: { asset: BTC, ticker: 'BTC', precision: 8 },
};

const blankInvoice = JSON.stringify({
  address: null,
  addressType: 'bech32',
  amount: null,
  currency: '',
  fiatAmount: null,
  fiatTip: null,
  memo: null,
  network: '',
  rate: 0,
  received: 0,
  user: JSON.parse(JSON.stringify(blankUser)),
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
  memo: null,
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
  addressType: 'bech32',
  asset: BTC,
  assets: {},
  balances: null,
  challenge: '',
  channels: [],
  channelRequest: null,
  fullscreen: false,
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
  nfcEnabled: false,
  nodes: [],
  noNfc: false,
  orders: [],
  password: null,
  payment: JSON.parse(blankPayment),
  payments: [],
  proposal: null,
  proposals: [],
  psbt: null,
  pin: '',
  poll: null,
  prompt2fa: false,
  promptPassword: false,
  rate: 0,
  rates: null,
  received: JSON.parse(blankPayment),
  reader: null,
  seed: null,
  snack: '',
  socket: null,
  stopScanning: false,
  subscription: null,
  text: '',
  token: null,
  twofa: '',
  recipient: {
    currencies: ['CAD'],
    currency: 'CAD',
    accounts: [],
    account: { ticker: 'BTC' },
  },
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

      if (token === 'null') token = null;

      commit('token', token);

      const { path } = router.currentRoute;

      if (!(publicPaths.includes(path) || token || path.includes('login'))) {
        let user = {
          username: `satoshi-${v4().substr(0, 8)}`,
          password: 'password',
          confirm: 'password',
        };
        user = await dispatch('createUser', user);
        user.password = 'password';
        await dispatch('login', user);
        return go(path);
      }

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
            } catch (e) {}

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
      commit('loading', true);
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
      commit('loading', false);
    },

    async propose({ commit, getters, dispatch }, { a1, a2, v1, v2 }) {
      try {
        let {
          data: { proposal },
        } = await Vue.axios.get(
          `/proposal?v1=${(v1 / SATS).toFixed(8)}&v2=${(v2 / SATS).toFixed(
            8
          )}&a1=${a1}&a2=${a2}`
        );
        commit('proposal', proposal);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async deleteProposal({ commit, state, dispatch }, id) {
      const { proposals } = state;
      try {
        await Vue.axios.delete(`/proposal/${id}`);
        proposals.splice(
          proposals.findIndex(p => p.id === id),
          1
        );
        state.proposals = JSON.parse(JSON.stringify(proposals));
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async getProposals({ commit, getters, dispatch }) {
      commit('error', null);
      commit('loading', true);
      try {
        const { data: proposals } = await Vue.axios.get('/proposals');
        commit('proposals', proposals);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
      commit('loading', false);
    },

    async publish({ commit, getters, dispatch }) {
      const { proposal } = getters;

      try {
        await Vue.axios.post('/publish', { id: proposal.id });
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
        let res = await Vue.axios.post('/login', user);
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
      { name, ticker, precision, seed, path, pubkey }
    ) {
      if (!getters.password) await dispatch('passwordPrompt');
      const { password, user } = getters;
      seed = aes.encrypt(seed, password).toString();

      try {
        await Vue.axios.post('/accounts', {
          seed,
          pubkey,
          path,
          name,
          ticker,
          precision,
        });

        go('/wallets');
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async addLinkingKey({}, key) {
      const res = await Vue.axios.post('/keys', { key });
    },

    async passwordPrompt({ commit, dispatch, getters }, resolve) {
      commit('promptPassword', true);

      let interval;

      await new Promise((resolve, reject) => {
        interval = setInterval(() => {
          if (getters.seed) resolve() && l('resolved');
        }, 1000);
      });

      clearInterval(interval);
      commit('promptPassword', false);

      const { seed, password } = getters;
      return { seed, password };
    },

    async getNewAddress({ commit, dispatch, state }) {
      let { invoice, password, user } = state;
      let { addressType, network } = invoice;

      if (!['bitcoin', 'liquid'].includes(network))
        commit('error', 'Invalid network');
      let address;

      let { index, pubkey, id, seed } = user.account;

      if (user.account.pubkey) {
        if (!password) ({ password } = await dispatch('passwordPrompt'));
        const decryptedSeed = aes.decrypt(seed, password).toString(Utf8);
        const root = fromSeed(
          Buffer.from(sha256(decryptedSeed), 'hex'),
          this._vm.$network
        );
        const hd = root.derivePath(invoice.path);
        const type = {
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
        }

        if (addressType !== 'p2sh-segwit') {
          ({ address } = p[type]({
            pubkey: hd.publicKey,
            network: n,
          }));
        } else {
          ({ address } = p[type]({
            redeem: p.p2wpkh({
              pubkey: hd.publicKey,
              network: n,
            }),
            network: n,
          }));
        }

        index++;
        await Vue.axios.post('/account', { id, address, index });

        invoice.address = address;
        return address;
      } else {
        ({ data: address } = await Vue.axios.get(
          `/address?network=${network}&type=${addressType}`
        ));
      }

      invoice.address = address;
      return address;
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
      if (user.currency === currency) return;
      if (!(user.currencies.includes(currency) && rates[currency])) return;
      const rate = rates[currency];

      user.fiat = true;
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
        setTimeout(() => reject(new Error('Socket timeout')), 5000);
        const proto = location.protocol === 'https:' ? 'wss://' : 'ws://';

        const open = () => {
          const { socket: ws, user, token } = getters;
          if (ws && ws.readyState === 1) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));

            if (!user || !user.payments) {
              ws.send(JSON.stringify({ type: 'login', data: token }));
            } else {
              resolve();
              return true;
            }
          }

          return false;
        };

        if (open()) return;

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

        ws.onmessage = msg => {
          commit('socket', ws);
          let { type, data } = JSON.parse(msg.data);

          switch (type) {
            case 'connected':
              getters.socket.id = data;
              break;

            case 'account':
              commit('addAccount', data);
              break;

            case 'accounts':
              getters.user.accounts = data;
              break;

            case 'key':
              commit('addKey', data);
              break;

            case 'login':
              if (data) {
                commit('user', data);
                resolve();
              } else {
                dispatch('logout');
              }
              break;

            case 'logout':
              dispatch('logout');
              break;

            case 'otpsecret':
              commit('user', { ...state.user, otpsecret: data });
              break;

            case 'payment':
              commit('addPayment', data);
              break;

            case 'proposal':
              commit('addProposal', data);
              break;

            case 'rate':
              const rate = data;
              const rates = {};
              const { fx, user } = getters;
              if (!fx || !rate || !user.currencies) return;

              user.currencies.map(symbol => {
                rates[symbol] = rate * fx[symbol];
              });

              commit('rates', rates);
              if (user && user.currency) commit('rate', rates[user.currency]);
              break;

            case 'to':
              let { payment } = getters;
              if (!getters.user.account.pubkey) payment.recipient = data;
              break;

            case 'user':
              commit('user', data);
              break;

            case 'version':
              commit('version', data.trim());
              break;
          }
        };
      });
    },

    async issueAsset({ commit, dispatch }, asset) {
      try {
        await Vue.axios.post('/assets', asset);
        go('/wallets');
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
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

    async estimateFee({ commit, dispatch, getters }) {
      commit('error', null);
      commit('loadingFee', true);

      let { payment, user, seed } = getters;
      let { asset } = user.account;
      let { address, amount, feeRate } = payment;

      let params = { address, amount, asset, feeRate };

      if (address) {
        try {
          let network = isLiquid(address) ? 'liquid' : 'bitcoin';
          let {
            data: { feeRate, tx },
          } = await Vue.axios.post(`/${network}/fee`, params);

          payment.feeRate = feeRate;
          payment.tx = tx;

          if (user.account.pubkey) {
            commit('psbt', tx);
            if (!seed) ({ seed } = await dispatch('passwordPrompt'));
            const root = fromSeed(Buffer.from(sha256(seed), 'hex'));

            let psbt, network;

            if (user.account.ticker === 'LBTC') {
              psbt = lqPsbt.fromBase64(tx);
              network = this._vm.$lqnetwork;
            } else {
              psbt = Psbt.fromBase64(tx);
              network = this._vm.$network;
            }

            psbt.data.inputs.map((input, inputIndex) => {
              for (let i = user.account.index; i >= 0; i--) {
                const hd = root.derivePath(`m/84'/0'/0'/0/${i}`);

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
          }
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
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async sendPayment({ commit, dispatch, getters }) {
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
          route,
          signed,
        },
      } = getters;

      if (signed) {
        try {
          let { data: payment } = await Vue.axios.post(
            `/${payment.network}/broadcast`,
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

    async addInvoice({ commit, dispatch, state }, params) {
      commit('loading', true);
      const { controller, invoice, rate, socket } = state;
      if (!(invoice.user && invoice.user.id)) invoice.user = state.user;
      const { user } = invoice;
      if (!invoice.path)
        invoice.path = `${user.account.path}/${user.account.index}`;
      if (!invoice.currency) invoice.currency = user.currency;

      if (!invoice.network) {
        if (user.account.pubkey) invoice.network = 'bitcoin';
        else invoice.network = 'lightning';
      }

      if (controller) controller.abort();

      if (!invoice.amount) invoice.amount = null;
      const { amount, memo, tip } = invoice;

      invoice.address = null;
      invoice.received = 0;
      invoice.rate = rate;
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
          invoice.address = await dispatch('getNewAddress', 'p2sh-segwit');
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
        let { data } = await Vue.axios.post(`/invoice`, { invoice, user });
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
      let { nodes, payment, user } = getters;

      if (nodes.includes('lightning')) {
        try {
          if (text.toLowerCase().slice(0, 10) === 'lightning:')
            text = text.slice(10);
          let payreq = text.toLowerCase();
          payment.payreq = payreq;
          payment.payobj = bolt11.decode(payment.payreq);
          let { coinType } = payment.payobj;

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
          payment.network = 'bitcoin';
          url.options.asset = BTC;
        }
      } catch (e) {
        if (nodes.includes('liquid')) {
          try {
            url = bip21.decode(text, 'liquidnetwork');
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

        await dispatch('estimateFee');
        go({ name: 'send', params: { keep: true } });
        return;
      }

      if (nodes.includes('bitcoin') && validate(text)) {
        payment.address = text;
        payment.network = 'bitcoin';
        go({ name: 'send', params: { keep: true } });
        return;
      }

      // Liquid
      if (nodes.includes('liquid') && isLiquid(text)) {
        payment.address = text;
        payment.network = 'liquid';
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

      if (text.toLowerCase().startsWith('lnurl')) {
        commit('loading', true);
        text = text.toLowerCase();

        try {
          const { data: params } = await Vue.axios.get(`/decode?text=${text}`);
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

                const response = await Vue.axios.post('/login', {
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

          if (payment)
            window.location.href = `${window.location.protocol}//${window.location.host}/redeem/${text}`;

          return;
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

    async pay({ commit, getters }, amount) {
      commit('loading', true);
      const { lnurl: params } = getters;

      try {
        await Vue.axios.post('/pay', { amount, params });
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

    async getLoginUrl({ commit, getters }) {
      const { user } = getters;
      let url = '/login';
      if (user.username) url += `?username=${user.username}`;

      try {
        const { data: lnurl } = await Vue.axios.get(url);
        commit('lnurl', lnurl);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
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
    addProposal(s, v) {
      let index = s.proposals.findIndex(p => p.id === v.id);
      if (index > -1) s.proposals[index] = v;
      else s.proposals.unshift(v);
      s.proposals = JSON.parse(JSON.stringify(s.proposals));
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
  getters: make.getters(state),
});
