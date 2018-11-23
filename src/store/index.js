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

function deleteCookie (n) {
  document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

export default new Vuex.Store({
  state: {
    address: '',
    amount: 0,
    balance: 0,
    channels: [],
    error: '',
    fees: 0,
    loading: false,
    payment: null,
    payobj: null,
    payreq: '',
    peers: [],
    rate: 0,
    received: 0,
    scan: '',
    scanning: false,
    snack: '',
    socket: null,
    token: '',
    payments: [],
    user: {
      address: null,
      balance: null,
      channelbalance: null,
    },
  },
  actions: {
    async init ({ commit, dispatch, state }) {
      let token = readCookie('token')
      if (token || window.QRScanner) {
        if (!state.user.balance) {
          await dispatch('getUser')
        } else if (router.currentRoute === '/login') {
          router.push('/home')
        } 

        await dispatch('setupSockets')
        commit('SET_TOKEN', token)
      }
    },

    async login ({ commit, dispatch }, user) {
      try {
        let res = await Vue.axios.post('/login', user)
        await commit('SET_USER', res.data.user)
      } catch (e) {
        commit('SET_ERROR', 'Login failed')
        return
      }

      dispatch('init')
      router.push('/home')
    },

    async logout({ commit, state }) {
      deleteCookie('token')
      commit('SET_USER', null)
      if (state.socket) state.socket.disconnect()
    }, 

    async setupSockets ({ commit, state, dispatch }) {
      let s = socketio(process.env.SOCKETIO)
      commit('SET_SOCKET', s)

      s.on('tx', data => {
        bitcoin.Transaction.fromHex(data).outs.map(o => {
          try {
            let network = bitcoin.networks.bitcoin
            if (process.env.NODE_ENV !== 'production') {
              network = bitcoin.networks.testnet
            } 
            let address = bitcoin.address.fromOutputScript(o.script, network)
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

    async getChannels({ commit }) {
      let res = await Vue.axios.get('/channels')

      commit('SET_CHANNELS', res.data.channels)
    },

    async getPeers({ commit }) {
      let res = await Vue.axios.get('/peers')

      commit('SET_PEERS', res.data.peers)
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
      commit('SET_LOADING', false)
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

    async scan ({ commit, dispatch }) {
      commit('SET_SCANNING', true)

      if (window.QRScanner) {
        window.QRScanner.prepare((err) => {
          if (err) {
            console.error(err)
            return
          } 

          window.QRScanner.show(() => {
            document.querySelector('#app').style.display = 'none'
            document.querySelector('#camcontrols').style.display = 'block'
            
            window.QRScanner.scan((err, res) => {
              if (err) { 
                console.log(err) 
              } else {
                dispatch('handleScan', res)
              }

              document.querySelector('#app').style.display = 'block'
              document.querySelector('#camcontrols').style.display = 'none'
            
              window.QRScanner.destroy()
            })
          })
        })
      }
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

      commit('SET_SCANNING', false)
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
    SET_CHANNELS (s, v) { s.channels = v },
    SET_ERROR (s, v) { 
      s.error = v 
      if (v && v.toString().includes('502 Bad')) s.error = 'Problem connecting to server'
    },
    SET_LOADING (s, v) { s.loading = v },
    SET_PAYMENT (s, v) { s.payment = v },
    SET_PAYOBJ (s, v) { s.payobj = v },
    SET_PAYREQ (s, v) { s.payreq = v },
    SET_PEERS (s, v) { s.peers = v },
    SET_RATE (s, v) { s.rate = v },
    SET_RECEIVED (s, v) { s.received = v },
    SET_SCAN (s, v) { s.scan = v },
    SET_SCANNING (s, v) { s.scanning = v },
    SET_SNACK (s, v) { s.snack = v },
    SET_SOCKET (s, v) { s.socket = v },
    SET_TOKEN (s, v) { s.token = v },
    SET_PAYMENTS (s, v) { s.payments = v },
    SET_USER (s, v) { Vue.set(s, 'user', v) },
  },
  getters: {
    address: s => s.address,
    amount: s => s.amount,
    balance: s => s.balance,
    channels: s => s.channels,
    error: s => s.error,
    fees: s => s.fees,
    loading: s => s.loading,
    payment: s => s.payment,
    payments: s => s.payments,
    payobj: s => s.payobj,
    payreq: s => s.payreq,
    peers: s => s.peers,
    rate: s => s.rate,
    received: s => s.received,
    scanning: s => s.scanning,
    snack: s => s.snack,
    socket: s => s.socket,
    token: s => s.token,
    user: s => s.user,
  },
})
