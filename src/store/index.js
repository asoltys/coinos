import Vue from 'vue';
import Vuex from 'vuex';
import bech32 from 'bech32';
import bip21 from 'bip21';
import { fromSeed } from 'bip32';
import bolt11 from 'bolt11';
import router from '../router';
import validate from 'bitcoin-address-validation';
import { crypto, ECPair, payments, networks, Psbt } from 'bitcoinjs-lib';
import pathify, { make } from 'vuex-pathify';
import paths from '../paths';
import format from '../format';
import { generateMnemonic } from 'bip39';
import cryptojs from 'crypto-js';
import sha256, { HMAC } from 'fast-sha256';
import secp256k1 from 'secp256k1';
import { isUuid, uuid } from 'uuidv4';

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
  memo: null,
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
  addressTypes,
  asset: BTC,
  assets: [],
  challenge: '',
  channels: [],
  channelRequest: null,
  readController: null,
  writeController: null,
  ecpair: null,
  error: '',
  friends: [],
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
  payment: JSON.parse(blankPayment),
  payments: [],
  psbt: null,
  pin: '',
  prompt2fa: false,
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
  user: {
    address: null,
    balance: null,
  },
  versionMismatch: null,
  version: null,
};

export default new Vuex.Store({
  plugins: [pathify.plugin],
  state,
  actions: {
    async init({ commit, getters, dispatch, state }) {
      const { path } = router.currentRoute;
      commit('error', '');
      if (path === '/login' || path === '/register') {
        commit('initializing', false);
        commit('loading', false);
        return;
      }

      try {
        let info = (await Vue.axios.get('/info')).data;
        commit('assets', (await Vue.axios.get('/assets')).data);
        commit('info', info);
        commit('nodes', info.nodes);
        commit('rates', info.rates);
        commit('version', info.clientVersion.trim());
      } catch (e) {
        l(e);
        commit('error', 'Problem connecting to server');
      }

      let token = getters.token || window.sessionStorage.getItem('token');

      if (!token) {
        let cookie = `; ${document.cookie}`.match(';\\s*token=([^;]+)');
        if (cookie && cookie[1]) token = cookie[1];
      }

      if (!token || token === 'null') {
        if (paths.includes(path)) commit('initializing', false);
        else go('/login');
        return;
      }

      if (token && token !== 'null') {
        commit('token', token);
        let failures = 0;
        try {
          await dispatch('setupSocket');
          const socketPoll = async () => {
            try {
              await dispatch('setupSocket');
              failures = 0;
            } catch (e) {
              if (failures > 5) commit('error', 'Problem connecting to server');
              else failures++;
            }

            if (getters.user && getters.token) setTimeout(socketPoll, 5000);
          };
          socketPoll();

          commit('initializing', false);
          commit('loading', false);

          if (path === '/' || path === '/register') go('/home');
        } catch (e) {
          l('failed to setup sockets', e);
          go('/login');
        }
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
      const { password } = user;
      const {
        AES: aes,
        enc: { Utf8 },
      } = cryptojs;

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

        commit('seed', seed);
      } catch (e) {
        if (e.response && e.response.data.startsWith('2fa'))
          commit('prompt2fa', true);
        else commit('error', 'Login failed');
        return;
      }

      await dispatch('init');

      if (router.currentRoute.path !== '/home') go('/home');
    },

    async addLinkingKey({}, key) {
      const res = await Vue.axios.post('/keys', { key });
    },

    async getNewAddress({ commit, dispatch, state }) {
      let type = state.addressTypes.shift();
      state.addressTypes.push(type);
      state.invoice.address = (await Vue.axios.post('/address', { type })).data;
      dispatch('addInvoice');
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
      commit('loading', true);
      let { subscription } = state;
      await Vue.axios.post('/logout', { subscription });
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.sessionStorage.removeItem('token');
      commit('token', null);
      commit('pin', null);
      commit('user', null);
      if (state.socket) state.socket.close();
      commit('seed', null);
      commit('socket', null);
      commit('subscription', null);
      go('/');
      commit('loading', false);
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
      await new Promise((resolve, reject) => {
        setTimeout(reject, 5000);
        const proto = location.protocol === 'https:' ? 'wss://' : 'ws://';
        if (!getters.token) return reject();
        if (getters.socket) {
          if (getters.socket.readyState === 1) return resolve();
          else {
            commit('socket', null);
          }
        }
        let ws = new WebSocket(`${proto}${location.host}/ws`);
        commit('socket', ws);

        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'login', data: getters.token }));
          commit('error', null);
        };

        ws.onerror = () => {
          commit('error', 'Problem connecting to server');
          ws.close();
          reject();
        };

        ws.onclose = async e => {
          ws = null;
          reject();
          try {
            await dispatch('setupSocket');
          } catch (e) {}
        };

        ws.onmessage = msg => {
          let { type, data } = JSON.parse(msg.data);

          switch (type) {
            case 'account':
              commit('addAccount', data);
              break;

            case 'accounts':
              getters.user.accounts = data;
              break;

            case 'key':
              commit('addKey', data);
              break;

            case 'payment':
              commit('addPayment', data);
              break;

            case 'login':
              if (data) {
                commit('user', data);
                resolve();
              } else {
                dispatch('logout');
              }
              break;

            case 'otpsecret':
              commit('user', { ...state.user, otpsecret: data });
              break;

            case 'rates':
              const rates = data;
              if (!rates) return;
              commit('rates', rates);
              if (getters.user && getters.user.currency)
                commit('rate', rates[getters.user.currency]);
              break;

            case 'to':
              let { payment } = getters;
              payment.recipient = data;
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
        go('/assets');
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async createUser({ commit, dispatch }, user) {
      commit('error', null);
      commit('loading', true);
      try {
        await Vue.axios.post('/register', { user });
        dispatch('login', user);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
      commit('loading', false);
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

      l('estimating fee');
      if (address) {
        if (isLiquid(address)) {
          try {
            let {
              data: { feeRate, tx, psbt },
            } = await Vue.axios.post('/liquid/fee', params);
            payment.feeRate = feeRate;
            payment.tx = tx;
            l('fee rate', feeRate);
            commit('psbt', psbt);
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
          memo,
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
          memo,
          username,
        });
        res.data.sent = true;
        commit('payment', res.data);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
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
        payment.amount += payment.fee;
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async sendPayment({ commit, dispatch, getters }) {
      commit('loading', true);
      commit('error', null);

      let {
        payment: { address, amount, asset, memo, tx, payreq, route },
      } = getters;

      if (payreq.startsWith('lnbc')) {
        try {
          let res = await Vue.axios.post('/lightning/send', {
            amount,
            memo,
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
    },

    async clearPayment({ commit }) {
      let payment = JSON.parse(blankPayment);
      commit('payment', payment);
      commit('error', null);
    },

    async addInvoice({ commit, dispatch, state }, method) {
      const { controller, invoice, user } = state;
      if (controller) controller.abort();

      if (!invoice.amount) invoice.amount = null;
      const { amount, memo, tip } = invoice;

      method = method || invoice.method;
      invoice.memo = memo;
      invoice.method = method;
      invoice.network = methods[method];
      invoice.uuid = uuid();

      const url = address => {
        let url = amount || memo ? `${method}:${address}?` : address;
        if (amount)
          url += `amount=${((amount + tip) / SATS).toFixed(8)}${memo ? '&' : ''}`;
        if (memo) url += `message=${memo}`;
        return url;
      };

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
        await Vue.axios.post(`/invoice`, { invoice });
        commit('invoice', invoice);
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }

      dispatch('write', invoice.uuid);
    },

    async write({ commit, dispatch }, text) {
      if ('NDEFWriter' in window) {
        const controller = new AbortController();
        const signal = controller.signal;
        commit('writeController', controller);

        const writer = new NDEFWriter();

        l('writing', text);
        try {
          await writer.write(text, { signal });
          dispatch('snack', 'Successfully wrote to NFC tag');
        } catch (e) {
          l('failed to write NFC tag', e);
        }
      }
    },

    async stopWriting({ getters }) {
      const { controller } = getters;
      controller.abort();
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

    async generateChannelRequest({ commit }, { localAmt, pushAmt }) {
      try {
        let result = await Vue.axios.post('/lightning/channelRequest', {
          localAmt,
          pushAmt,
        });
        commit('channelRequest', result.data);
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
            await dispatch('shiftAccount', process.env.VUE_APP_LBTC);

          let { tags, satoshis, millisatoshis } = payment.payobj;
          let description = tags.find(t => t.tagName === 'description');
          if (description) payment.memo = description.data;
          payment.amount = millisatoshis
            ? Math.round(millisatoshis / 1000)
            : satoshis;
          payment.fiatAmount = ((payment.amount * getters.rate) / SATS).toFixed(
            2
          );
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
        let { amount, asset, message } = url.options;
        let account = user.accounts.find(a => a.asset === asset);
        if (account) await dispatch('shiftAccount', account.asset);
        else return commit('error', 'Unrecognized asset');

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
        /* */
      }

      if (text.toLowerCase().startsWith('lnurl')) {
        commit('loading', true);
        text = text.toLowerCase();
        const { data: params } = await Vue.axios.get(`/decode?text=${text}`);
        if (params.status === 'ERROR') {
          let json = params.reason.replace(/.*{/, '{');
          return commit('error', JSON.parse(json).reason);
        }

        let { seed } = getters;

        switch (params.tag) {
          case 'channelRequest':
            await dispatch('openChannel', params);
            break;
          case 'login':
            if (!seed) return dispatch('logout');
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

        commit('loading', false);
      }

      if (text.startsWith('w:')) {
        try {
          const { data: lnurl } = await Vue.axios.get(
            `/url?code=${text.substr(2)}`
          );
          await dispatch('handleScan', lnurl);
          return;
        } catch (e) {
          commit('error', e.response ? e.response.data : e.message);
        }
      }

      if (isUuid(text)) {
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

    async getPaymentUrl({ commit, getters }, amount) {
      try {
        return (await Vue.axios.get(`/pay?amount=${amount}`)).data;
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
        dispatch('write', 'w:' + withdrawUrl.encoded.substr(64));
        return withdrawUrl;
      } catch (e) {
        commit('error', e.response ? e.response.data : e.message);
      }
    },

    async getLoginUrl({ commit, getters }) {
      const { user } = getters;
      let url = '/login';
      if (user.username) url += `?username=${user.username}`;
      return (await Vue.axios.get(url)).data;
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
    addAccount(s, v) {
      let index = s.user.accounts.findIndex(a => a.id === v.id);
      if (index > -1) s.user.accounts[index] = v;
      else s.user.accounts.unshift(v);
      if (s.user.account.id === v.id) s.user.account = v;
      s.user = JSON.parse(JSON.stringify(s.user));
    },
    addKey(s, v) {
      let index = s.user.keys.findIndex(a => a.id === v.id);
      console.log(index, v);
      if (index > -1) s.user.keys[index] = v;
      else s.user.keys.unshift(v);
      console.log(s.user.keys);
      s.user = JSON.parse(JSON.stringify(s.user));
    },
    addPayment(s, v) {
      if (v.amount > 0) {
        s.received = v;
        s.invoice.received += parseInt(Math.abs(v.amount));
      }
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
        if (v.currencies && !Array.isArray(v.currencies))
          v.currencies = JSON.parse(v.currencies);
        Object.keys(v).map(k => (s.user[k] = v[k]));
        s.user = JSON.parse(JSON.stringify(s.user));
      } else {
        if (v) s.user = v;
        else s.user = {};
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
