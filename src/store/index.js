import apolloClient from '../apollo-client'
import socketio from 'socket.io-client'
import Vue from 'vue'
import Vuex from 'vuex'
import getUserQuery from '../graphql/getUser.gql'
import transactionsQuery from '../graphql/transactions.gql'
import createUser from '../graphql/createUser.gql'
import updateUser from '../graphql/updateUser.gql'
import bip21 from 'bip21'
import bolt11 from 'bolt11'
import router from '../router'
import bitcoin from 'bitcoinjs-lib'
Vue.use(Vuex)

const l = console.log

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
    payment: null,
    payobj: null,
    payreq: '',
    received: 0,
    scan: '',
    transactions: {},
    token: '',
    user: null,
    socket: null,
  },
  actions: {
    async login ({ commit, state, dispatch }, user) {
      let res = await Vue.axios.post('/login', user)
      await commit('SET_USER', res.data.user)
      dispatch('getUser')
      commit('SET_TOKEN', readCookie('token'))
      router.push('/home')

      commit('SET_SOCKET', socketio(process.env.SOCKETIO))

      state.socket.on('connection', data => l(data))
      state.socket.on('success', data => l(data))

      state.socket.on('tx', data => {
        bitcoin.Transaction.fromHex(data).outs.map(o => {
          try {
            let address = bitcoin.address.fromOutputScript(o.script, bitcoin.networks.testnet)
            if (address === state.user.address) {
              commit('SET_RECEIVED', o.value)
            } 
          } catch(e) { /* */ }
        })

        dispatch('getUser')
      })

      state.socket.on('invoice', data => {
        commit('SET_RECEIVED', data.value)
      })
    },

    async createUser ({ commit, dispatch }, user) {
      delete user['passconfirm']
      await apolloClient.mutate({
        mutation: createUser,
        variables: {
          user: user,
        },
      })

      dispatch('login', user)
    },

    async updateUser ({ commit }, user) {
      await apolloClient.mutate({
        mutation: updateUser,
        variables: {
          user: user,
        },
      })
    },

    async getUser ({ commit, state }) {
      let res = await apolloClient.query({
        query: getUserQuery,
        variables: {
          username: state.user.username,
        },
        fetchPolicy: 'network-only',
      })

      commit('SET_USER', res.data.users[0])
    },

    async getTransactions ({ commit }) {
      let res = await apolloClient.query({
        query: transactionsQuery,
        fetchPolicy: 'network-only',
      })

      commit('SET_TRANSACTIONS', res.data.transactions)
    },

    async getBalance ({ commit }) {
      let res = await Vue.axios.get('/balance')

      commit('SET_BALANCE', res.data.balance)
    },

    async faucet ({ dispatch }) {
      await Vue.axios.post('/faucet')
      dispatch('getUser')
    },

    async openChannel ({ dispatch }) {
      await Vue.axios.post('/openchannel')
      dispatch('getUser')
    },

    async closeChannels ({ dispatch }) {
      await Vue.axios.post('/closechannels')
      dispatch('getUser')
    },

    async sendPayment ({ commit, dispatch, getters }) {
      let { address, amount, payreq } = getters
      if (payreq) {
        try {
          let res = await Vue.axios.post('/sendPayment', { payreq })
          commit('SET_PAYMENT', res.data)
        } catch (e) {
          commit('SET_ERROR', e)
        } 
      }
      else if (address) {
        let res = await Vue.axios.post('/sendCoins', { address, amount })
        commit('SET_PAYMENT', res.data)
      }

      dispatch('getUser')
    },

    async clearPayment ({ commit }) {
      commit('SET_PAYREQ', '')
      commit('SET_ADDRESS', '')
      commit('SET_PAYMENT', null)
      commit('SET_PAYOBJ', null)
    },

    async addInvoice ({ commit }, amount) {
      let res = await Vue.axios.post('/addInvoice', { amount })

      commit('SET_PAYREQ', res.data.payment_request)
    },

    async handleScan ({ commit, dispatch }, text) {
      await dispatch('clearPayment')

      try { 
        let payobj = bolt11.decode(text)
        commit('SET_PAYOBJ', payobj)
        commit('SET_PAYREQ', text)
        router.push('/send')
      } catch (e) { /**/ }

      try {
        let url = bip21.decode(text)
        commit('SET_ADDRESS', url.address)
        commit('SET_AMOUNT', url.options.amount)
        router.push('/send')
      } catch (e) { /**/ } 

      try {
        bitcoin.address.fromBase58Check(text)
        commit('SET_ADDRESS', text)
        router.push('/send')
      } catch (e) { /**/ }
    },
  },
  mutations: {
    SET_ADDRESS (s, v) { s.address = v },
    SET_AMOUNT (s, v) { s.amount = v },
    SET_BALANCE (s, v) { s.balance = v },
    SET_CHANNEL_BALANCE (s, v) { Vue.set(s.user, 'channelbalance', v) },
    SET_ERROR (s, v) { s.error = v },
    SET_PAYMENT (s, v) { s.payment = v },
    SET_PAYOBJ (s, v) { s.payobj = v },
    SET_PAYREQ (s, v) { s.payreq = v },
    SET_RECEIVED (s, v) { s.received = v },
    SET_SCAN (s, v) { s.scan = v },
    SET_SOCKET (s, v) { s.socket = v },
    SET_TOKEN (s, v) { s.token = v },
    SET_TRANSACTIONS (s, v) { s.transactions = v },
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
    payment: s => s.payment,
    payobj: s => s.payobj,
    payreq: s => s.payreq,
    received: s => s.received,
    token: s => s.token,
    transactions: s => s.transactions,
  },
})
