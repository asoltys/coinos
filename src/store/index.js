import apolloClient from '../apollo-client'
import Vue from 'vue'
import Vuex from 'vuex'
import getUserQuery from '../graphql/getUser.gql'
import transactionsQuery from '../graphql/transactions.gql'
import createUser from '../graphql/createUser.gql'
import updateUser from '../graphql/updateUser.gql'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    transactions: {},
    balance: 0,
    payreq: '',
    payment: null,
    scan: '',
  },
  actions: {
    async createUser ({ commit }, user) {
      delete user['passconfirm']
      await apolloClient.mutate({
        mutation: createUser,
        variables: {
          user: user,
        },
      })
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
      await dispatch('getUser')
    },

    async openChannel ({ dispatch }) {
      await Vue.axios.post('/openchannel')
      await dispatch('getUser')
    },

    async closeChannels ({ dispatch }) {
      await Vue.axios.post('/closechannels')
      await dispatch('getUser')
    },

    async sendPayment ({ commit, state, dispatch }, payreq) {
      let res = await Vue.axios.post('/sendPayment', { payreq })
      commit('SET_PAYMENT', res.data)
    },

    async clearPayment ({ commit }) {
      commit('SET_PAYMENT', null)
    },

    async addInvoice ({ commit }, amount) {
      let res = await Vue.axios.post('/addInvoice', { amount })

      commit('SET_PAYREQ', res.data.payment_request)
    },
  },
  mutations: {
    SET_USER (s, v) { Vue.set(s, 'user', v) },
    SET_TRANSACTIONS (s, v) { s.transactions = v },
    SET_BALANCE (s, v) { s.balance = v },
    SET_CHANNEL_BALANCE (s, v) { Vue.set(s.user, 'channelbalance', v) },
    SET_PAYREQ (s, v) { s.payreq = v },
    SET_PAYMENT (s, v) { s.payment = v },
    SET_SCAN (s, v) { s.scan = v },
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
    transactions: s => s.transactions,
    balance: s => s.balance,
    payreq: s => s.payreq,
    payment: s => s.payment,
  },
})
