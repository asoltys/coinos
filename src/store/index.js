import apolloClient from '../apollo-client'
import socketio from 'socket.io-client'
import Vue from 'vue'
import Vuex from 'vuex'
import getUserQuery from '../graphql/getUser.gql'
import paymentsQuery from '../graphql/getPayments.gql'
import bech32 from 'bech32'
import bip21 from 'bip21'
import bolt11 from 'bolt11'
import router from '../router'
import bitcoin from 'bitcoinjs-lib'
Vue.use(Vuex)

function readCookie (n) {
  let a = `; ${document.cookie}`.match(`;\\s*${n}=([^;]+)`)
  return a ? a[1] : ''
}

export default new Vuex.Store({
  state: {
    address: '',
    amount: 0,
    balance: 0,
    error: '',
    fees: 0,
    loading: false,
    payment: null,
    payobj: null,
    payreq: '',
    rate: 0,
    received: 0,
    scan: '',
    snack: '',
    socket: null,
    token: '',
    payments: [],
    user: null,
  },
  actions: {
    async login ({ commit, dispatch }, user) {
      try {
        let res = await Vue.axios.post('/login', user)
        await commit('SET_USER', res.data.user)
      } catch (e) {
        commit('SET_ERROR', 'Login failed')
        return
      }

      dispatch('getUser')
      dispatch('setupSockets')
      commit('SET_TOKEN', readCookie('token'))
      router.push('/home')
    },

    async logout({ commit, state }) {
      commit('SET_USER', null)
      state.socket.disconnect()
    }, 

    async setupSockets ({ commit, state, dispatch }) {
      let s = socketio(process.env.SOCKETIO)
      commit('SET_SOCKET', s)

      s.on('tx', data => {
        bitcoin.Transaction.fromHex(data).outs.map(o => {
          try {
            let address = bitcoin.address.fromOutputScript(o.script, bitcoin.networks.testnet)
            if (address === state.user.address) {
              commit('SET_RECEIVED', o.value)
              dispatch('snack', `Received ${o.value} satoshis`)
            } 
          } catch(e) { /* */ }
        })

        dispatch('getUser')
      })

      s.on('invoice', data => {
        commit('SET_RECEIVED', data.value)
        dispatch('getUser')
        dispatch('snack', `Received ${data.value} satoshis`)
      })
    },

    async createUser ({ commit, dispatch }, form) {
      if (form.password !== form.passconfirm) {
        commit('SET_ERROR', 'Passwords don\'t match')
        return
      }

      /* eslint-disable-next-line */
      let { passconfirm, ...user } = form

      try {
        await Vue.axios.post('/register', user)
        dispatch('login', user)
      } catch (e) { 
        commit('SET_ERROR', e.response.data)
      }
    },

    /* eslint-disable-next-line */
    async updateUser ({ commit }, user) {
      await Vue.axios.post('/user', user)
    },

    async getUser ({ commit }) {
      let res = await apolloClient.query({
        query: getUserQuery,
        fetchPolicy: 'network-only',
      })

      commit('SET_USER', res.data.users[0])
    },

    async getPayments ({ commit }) {
      let res = await apolloClient.query({
        query: paymentsQuery,
        fetchPolicy: 'network-only',
      })

      commit('SET_PAYMENTS', res.data.payments)
    },

    async getRates ({ commit }) {
      let res = await Vue.axios('/rates')
      commit('SET_RATE', res.data.ask)
    },

    async getBalance ({ commit }) {
      let res = await Vue.axios.get('/balance')

      commit('SET_BALANCE', res.data.balance)
    },

    async faucet ({ dispatch }) {
      await Vue.axios.post('/faucet')
      dispatch('getUser')
    },

    async openChannel ({ commit, dispatch }) {
      dispatch('clearPayment')
      try {
        await Vue.axios.post('/openchannel')
        dispatch('getUser')
      } catch (e) { commit('SET_ERROR', e.response.data) } 
    },

    async closeChannels ({ dispatch }) {
      await Vue.axios.post('/closechannels')
      dispatch('getUser')
    },

    async sendPayment ({ commit, dispatch, getters }) {
      commit('SET_LOADING', true)

      let { address, amount, payreq } = getters
      if (payreq) {
        try {
          let res = await Vue.axios.post('/sendPayment', { payreq })
          commit('SET_PAYMENT', res.data)
        } catch (e) {
          commit('SET_ERROR', e.response.data)
        } 
      }
      else if (address) {
        try {
          let res = await Vue.axios.post('/sendCoins', { address, amount })
          commit('SET_PAYMENT', res.data)
        } catch (e) {
          commit('SET_ERROR', e.response.data)
        } 
      }

      commit('SET_LOADING', false)
      dispatch('getUser')
    },

    async clearPayment ({ commit }) {
      commit('SET_PAYREQ', '')
      commit('SET_ADDRESS', '')
      commit('SET_PAYMENT', null)
      commit('SET_PAYOBJ', null)
      commit('SET_AMOUNT', null)
      commit('SET_ERROR', null)
    },

    async addInvoice ({ commit }, { amount, tip }) {
      let res = await Vue.axios.post('/addInvoice', { amount, tip })

      commit('SET_PAYREQ', res.data.payment_request)
    },

    async handleScan ({ commit, dispatch }, text) {
      await dispatch('clearPayment')

      try { 
        if (text.slice(0, 10) === 'lightning:') text = text.slice(10)
        let payobj = bolt11.decode(text)
        commit('SET_PAYOBJ', payobj)
        commit('SET_PAYREQ', text)
        router.push({ name: 'send', params: { clear: false } })
      } catch (e) { /**/ }

      try {
        let url = bip21.decode(text)
        commit('SET_ADDRESS', url.address)
        commit('SET_AMOUNT', url.options.amount * 100000000)
        router.push({ name: 'send', params: { clear: false } })
      } catch (e) { /**/ } 

      try {
        bitcoin.address.fromBase58Check(text)
        commit('SET_ADDRESS', text)
        router.push({ name: 'send', params: { clear: false } })
      } catch (e) { /**/ }

      try {
        bech32.decode(text)
        commit('SET_ADDRESS', text)
        router.push({ name: 'send', params: { clear: false } })
      } catch (e) { /**/ }
    },

    async snack ({ commit }, msg) {
      commit('SET_SNACK', msg)
    }, 
  },
  mutations: {
    SET_ADDRESS (s, v) { s.address = v },
    SET_AMOUNT (s, v) { s.amount = v },
    SET_BALANCE (s, v) { s.balance = v },
    SET_CHANNEL_BALANCE (s, v) { Vue.set(s.user, 'channelbalance', v) },
    SET_ERROR (s, v) { s.error = v },
    SET_LOADING (s, v) { s.loading = v },
    SET_PAYMENT (s, v) { s.payment = v },
    SET_PAYOBJ (s, v) { s.payobj = v },
    SET_PAYREQ (s, v) { s.payreq = v },
    SET_RATE (s, v) { s.rate = v },
    SET_RECEIVED (s, v) { s.received = v },
    SET_SCAN (s, v) { s.scan = v },
    SET_SNACK (s, v) { s.snack = v },
    SET_SOCKET (s, v) { s.socket = v },
    SET_TOKEN (s, v) { s.token = v },
    SET_PAYMENTS (s, v) { s.payments = v },
    SET_USER (s, v) { Vue.set(s, 'user', v) },
  },
  getters: {
    user: s => {
      if (!s.user || !s.user.address) {
        return null
      } 

      /*
      let mnemonic = bip39.generateMnemonic()
      let seed = bip39.mnemonicToSeed(mnemonic)
      let key = bitcoin.HDNode.fromSeedBuffer(seed, bitcoin.networks.testnet).deriveHardened(44).deriveHardened(0)
      let child = key.derive(0).derive(0)
      s.user.address = child.getAddress().toString()
      */

      return s.user
    },
    address: s => s.address,
    amount: s => s.amount,
    balance: s => s.balance,
    error: s => s.error,
    fees: s => s.fees,
    loading: s => s.loading,
    payment: s => s.payment,
    payobj: s => s.payobj,
    payreq: s => s.payreq,
    rate: s => s.rate,
    received: s => s.received,
    snack: s => s.snack,
    socket: s => s.socket,
    token: s => s.token,
    payments: s => s.payments,
  },
})
