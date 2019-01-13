import apolloClient from '../apollo-client'
import socketio from 'socket.io-client'
import Vue from 'vue'
import Vuex from 'vuex'
import paymentsQuery from '../graphql/getPayments.gql'
import bech32 from 'bech32'
import bip21 from 'bip21'
import bolt11 from 'bolt11'
import router from '../router'
import bitcoin from 'bitcoinjs-lib'
Vue.use(Vuex)

const l = console.log

export default new Vuex.Store({
  state: {
    address: '',
    amount: 0,
    channels: [],
    error: '',
    fees: 0,
    friends: [],
    loading: false,
    payment: null,
    payobj: null,
    payreq: '',
    payuser: '',
    peers: [],
    rate: 0,
    received: 0,
    scan: '',
    scanning: false,
    scannedBalance: null,
    snack: '',
    socket: null,
    token: null,
    payments: [],
    user: {
      address: null,
      balance: null,
      readonly: true,
    },
  },
  actions: {
    async init ({ commit, dispatch, state }) {
      commit('SET_LOADING', true)
      commit('SET_SCANNING', false)
      commit('SET_ERROR', '')
      let token = window.sessionStorage.getItem('token')

      if (!token) {
        let cookie = `; ${document.cookie}`.match(';\\s*token=([^;]+)')
        if (cookie && cookie[1]) token = cookie[1]
      }

      if (token && token !== 'null') {
        commit('SET_TOKEN', token)
        await dispatch('setupSockets')
      }

      const publicpaths = ['/', '/login', '/about', '/register']
      if (!(publicpaths.includes(router.currentRoute.path) || (state.user && state.user.address))) {
        router.push('/')
      }
      commit('SET_LOADING', false)
    },

    async login ({ commit, dispatch }, user) {
      try {
        let res = await Vue.axios.post('/login', user)
        commit('SET_USER', res.data.user)
        commit('SET_TOKEN', res.data.token)
      } catch (e) {
        commit('SET_ERROR', 'Login failed')
        return
      }

      await dispatch('init')
      router.push('/home')
    },

    async facebookLogin ({ commit, dispatch }, data) {
      let { accessToken, userID } = data.authResponse
      let res

      switch (data.status) {
      case 'connected':
        res = await Vue.axios.post('/facebookLogin', { accessToken, userID })
        commit('SET_USER', res.data.user)
        commit('SET_TOKEN', res.data.token)
        await dispatch('init')
        router.push('/home')
        break
      } 
    },

    async logout({ commit, state }) {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      window.sessionStorage.removeItem('token')
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
      if (state.socket) state.socket.disconnect()
    }, 

    async buy ({ state, dispatch }, { amount, token }) {
      try {
        let sat = ((100000000 * amount / 100) / state.rate).toFixed(0)
        await Vue.axios.post('/buy', { amount, token, sat })
        router.push('/home')
        dispatch ('snack', `Bought ${sat} satoshis`)
      } catch (e) {
        l('error charging credit card', e)
        return
      }
    },

    async setupSockets ({ commit, state, dispatch }) {
      let s = socketio(process.env.SOCKETIO, { query: { token: state.token } })
      commit('SET_SOCKET', s)

      s.on('tx', data => {
        bitcoin.Transaction.fromHex(data).outs.map(o => {
          try {
            let network = bitcoin.networks.bitcoin
            if (process.env.NODE_ENV !== 'production' || window.location.href.includes('test')) {
              network = bitcoin.networks.testnet
            } 
            let address = bitcoin.address.fromOutputScript(o.script, network)
            if (address === state.user.address) {
              commit('SET_RECEIVED', o.value)
              dispatch('snack', `Received ${o.value} satoshi`)
            } 
          } catch(e) { l(e) }
        })
      })

      s.on('block', () => {
        dispatch('getPayments')
      })

      s.on('invoice', data => {
        commit('SET_RECEIVED', data.value)
        dispatch('snack', `Received ${data.value} satoshi`)
      })

      s.on('rate', rate => commit('SET_RATE', rate))
      s.on('user', user => commit('SET_USER', user))

      return new Promise((resolve, reject) => {
        s.on('connected', () => {
          s.emit('getuser', {}, user => { 
            commit('SET_USER', user) 
            if (router.currentRoute.path === '/login' || router.currentRoute.path === '/') {
              router.push('/home')
            } 
            resolve()
          })
        })

        s.on('connect_failed', reject)
        s.on('error', reject)
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

    async getPayments ({ commit }) {
      commit('SET_LOADING', true)
      let res = await apolloClient.query({
        query: paymentsQuery,
        fetchPolicy: 'network-only',
      })
      commit('SET_LOADING', false)

      commit('SET_PAYMENTS', res.data.payments)
    },

    async getFriends ({ commit }) {
      commit('SET_LOADING', true)

      try {
        let res = await Vue.axios.get('/friends')
        commit('SET_FRIENDS', res.data)
      } catch (e) {
        commit('SET_ERROR', e.response.data)
      } 

      commit('SET_LOADING', false)
    },

    async getChannels({ commit }) {
      let res = await Vue.axios.get('/channels')

      commit('SET_CHANNELS', res.data.channels)
    },

    async getPeers({ commit }) {
      let res = await Vue.axios.get('/peers')

      commit('SET_PEERS', res.data.peers)
    },

    async sendPayment ({ commit, getters }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      let { address, amount, payreq, payuser } = getters

      if (payreq) {
        try {
          let res = await Vue.axios.post('/sendPayment', { payreq })
          commit('SET_PAYMENT', res.data)
        } catch (e) {
          commit('SET_ERROR', e.response.data)
        } 
      }
      else if (payuser) {
        try {
          let res = await Vue.axios.post('/payUser', { payuser, amount })
          commit('SET_PAYMENT', res.data)
        } catch (e) {
          commit('SET_ERROR', e.response.data)
          l(e)
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
    },

    async clearPayment ({ commit }) {
      commit('SET_LOADING', false)
      commit('SET_PAYREQ', '')
      commit('SET_ADDRESS', '')
      commit('SET_PAYMENT', null)
      commit('SET_PAYOBJ', null)
      commit('SET_PAYUSER', null)
      commit('SET_AMOUNT', 0)
      commit('SET_ERROR', null)
    },

    async addInvoice ({ commit }, { amount, tip, address }) {
      let res
      try {
        res = await Vue.axios.post('/addInvoice', { amount, tip, address })
        commit('SET_PAYREQ', res.data.payment_request)
      } catch (e) {
        commit('SET_ERROR', e.response.data)
      } 
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
                l(err) 
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
      commit('SET_SCANNING', false)

      try { 
        if (text.slice(0, 10) === 'lightning:') text = text.slice(10)
        let payobj = bolt11.decode(text)
        console.log('lightning', payobj)
        router.push({ name: 'send', params: { keep: true } })
        commit('SET_PAYOBJ', payobj)
        commit('SET_PAYREQ', text)
        return
      } catch (e) { /**/ }

      try {
        let url = bip21.decode(text)
        commit('SET_ADDRESS', url.address)
        commit('SET_AMOUNT', (url.options.amount * 100000000).toFixed(0))
        let network = (process.env.NODE_ENV !== 'production' || window.location.href.includes('test')) ? 'test3' : 'main'
        let res = await Vue.axios.get(`https://api.blockcypher.com/v1/btc/${network}/addrs/${url.address}/balance`)
        commit('SET_SCANNED_BALANCE', res.data.final_balance)
        router.push({ name: 'send', params: { keep: true } })
        return
      } catch (e) { /**/ } 

      try {
        bitcoin.address.fromBase58Check(text)
        commit('SET_ADDRESS', text)
        let network = (process.env.NODE_ENV !== 'production' || window.location.href.includes('test')) ? 'test3' : 'main'
        let res = await Vue.axios.get(`https://api.blockcypher.com/v1/btc/${network}/addrs/${text}/balance`)
        commit('SET_SCANNED_BALANCE', res.data.final_balance)
        router.push({ name: 'send', params: { keep: true } })
        return
      } catch (e) { /**/ }

      try {
        bech32.decode(text)
        commit('SET_ADDRESS', text)
        router.push({ name: 'send', params: { keep: true } })
        return
      } catch (e) { /**/ }
    },

    async snack ({ commit }, msg) {
      commit('SET_SNACK', msg)
    }, 
  },
  mutations: {
    SET_ADDRESS (s, v) { s.address = v },
    SET_AMOUNT (s, v) { s.amount = v },
    SET_CHANNELS (s, v) { s.channels = v },
    SET_ERROR (s, v) { 
      s.error = v 
      if (v && v.toString().includes('502 Bad')) s.error = 'Problem connecting to server'
    },
    SET_FRIENDS (s, v) { s.friends = v },
    SET_LOADING (s, v) { s.loading = v },
    SET_PAYMENT (s, v) { s.payment = v },
    SET_PAYOBJ (s, v) { s.payobj = v },
    SET_PAYREQ (s, v) { s.payreq = v },
    SET_PAYUSER (s, v) { s.payuser = v },
    SET_PEERS (s, v) { s.peers = v },
    SET_RATE (s, v) { s.rate = v },
    SET_RECEIVED (s, v) { s.received = v },
    SET_SCAN (s, v) { s.scan = v },
    SET_SCANNING (s, v) { s.scanning = v },
    SET_SCANNED_BALANCE (s, v) { s.scannedBalance = v },
    SET_SNACK (s, v) { s.snack = v },
    SET_SOCKET (s, v) { s.socket = v },
    SET_TOKEN (s, v) { 
      window.sessionStorage.setItem('token', v)
      Vue.axios.defaults.headers.common = { 'Authorization': `bearer ${v}` }
      s.token = v
    },
    SET_PAYMENTS (s, v) { s.payments = v },
    SET_USER (s, v) { Vue.set(s, 'user', v) },
  },
  getters: {
    address: s => s.address,
    amount: s => s.amount,
    channels: s => s.channels,
    error: s => s.error,
    fees: s => s.fees,
    friends: s => s.friends,
    loading: s => s.loading,
    payment: s => s.payment,
    payments: s => s.payments,
    payobj: s => s.payobj,
    payreq: s => s.payreq,
    payuser: s => s.payuser,
    peers: s => s.peers,
    rate: s => s.rate,
    received: s => s.received,
    scanning: s => s.scanning,
    scannedBalance: s => s.scannedBalance,
    snack: s => s.snack,
    socket: s => s.socket,
    token: s => s.token,
    user: s => s.user,
  },
})
