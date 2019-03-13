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
import pathify, { make } from 'vuex-pathify'
Vue.use(Vuex)

pathify.options.mapping = 'simple'

const l = console.log
const state = {
  address: '',
  amount: 0,
  channels: [],
  error: '',
  fees: 0,
  friends: [],
  loading: false,
  orders: [],
  payment: null,
  payobj: null,
  payreq: '',
  payuser: '',
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
}

export default new Vuex.Store({
  plugins: [pathify.plugin],
  state,
  actions: {
    async init({ commit, dispatch, state }) {
      commit('scanning', false)
      commit('error', '')
      let token = window.sessionStorage.getItem('token')

      if (!token) {
        let cookie = `; ${document.cookie}`.match(';\\s*token=([^;]+)')
        if (cookie && cookie[1]) token = cookie[1]
      }

      if (token && token !== 'null') {
        commit('token', token)
        await dispatch('setupSockets')
      }

      const publicpaths = ['/', '/login', '/about', '/register']
      if (
        !(
          publicpaths.includes(router.currentRoute.path) ||
          (state.user && state.user.address)
        )
      ) {
        router.push('/')
      }
    },

    async login({ commit, dispatch }, user) {
      try {
        let res = await Vue.axios.post('/login', user)
        commit('user', res.data.user)
        commit('token', res.data.token)
      } catch (e) {
        commit('error', 'login failed')
        l(e)
        return
      }

      await dispatch('init')
      router.push('/home')
    },

    async facebookLogin({ commit, dispatch }, data) {
      let { accessToken, userID } = data.authResponse
      let res

      switch (data.status) {
      case 'connected':
        res = await Vue.axios.post('/facebookLogin', { accessToken, userID })
        commit('user', res.data.user)
        commit('token', res.data.token)
        await dispatch('init')
        router.push('/home')
        break
      }
    },

    async logout({ commit, state }) {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      window.sessionStorage.removeItem('token')
      commit('token', null)
      commit('user', null)
      if (state.socket) state.socket.disconnect()
      commit('socket', null)
    },

    async verify({ dispatch }, data) {
      let res = await Vue.axios.get(`/verify/${data.email}/${data.token}`)
      if (res.data) dispatch('snack', 'Your email has been verified')
    },

    async buy({ state, dispatch }, { amount, token }) {
      try {
        let sat = ((100000000 * amount) / 100 / state.rate).toFixed(0)
        await Vue.axios.post('/buy', { amount, token, sat })
        router.push('/home')
        dispatch('snack', `Bought ${sat} satoshis`)
      } catch (e) {
        l('error charging credit card', e)
        return
      }
    },

    async setupSockets({ commit, state, dispatch }) {
      if (state.socket) return
      let s = socketio(process.env.SOCKETIO, { query: { token: state.token } })
      commit('socket', s)

      s.on('tx', data => {
        bitcoin.Transaction.fromHex(data).outs.map(o => {
          try {
            let network = bitcoin.networks.bitcoin
            if (
              process.env.NODE_ENV !== 'production' ||
              window.location.href.includes('test')
            ) {
              network = bitcoin.networks.testnet
            }
            let address = bitcoin.address.fromOutputScript(o.script, network)
            if (address === state.user.address) {
              commit('received', o.value)
              dispatch('snack', `Received ${o.value} satoshi`)
            }
          } catch (e) {
            l(e)
          }
        })
      })

      s.on('emailVerified', () => {
        dispatch('snack', 'Your email has been verified')
      })

      s.on('phoneVerified', () => {
        dispatch('snack', 'Your phone number has been verified')
      })

      s.on('block', () => {
        dispatch('getPayments')
      })

      s.on('invoice', data => {
        commit('received', data.value)
        dispatch('snack', `Received ${data.value} satoshi`)
      })

      s.on('rate', rate => commit('rate', rate))
      s.on('user', user => commit('user', user))

      return new Promise((resolve, reject) => {
        s.on('connected', () => {
          s.emit('getuser', {}, user => {
            if (user) {
              commit('user', user)
              if (
                router.currentRoute.path === '/login' ||
                router.currentRoute.path === '/'
              ) {
                router.push('/home')
              }
            }
            resolve()
          })
        })

        s.on('connect_failed', reject)
        s.on('error', reject)
      })
    },

    async createUser({ commit, dispatch }, user) {
      if (user.password !== user.passconfirm) {
        commit('error', 'passwords don\'t match')
        return
      }

      try {
        await Vue.axios.post('/register', user)
        dispatch('login', user)
      } catch (e) {
        commit('error', e.response.data)
      }
    },

    async updateUser({ commit }, user) {
      let res = await Vue.axios.post('/user', user)
      commit('user', res.data)
    },

    async requestEmail(_, email) {
      await Vue.axios.post('/requestEmail', { email })
    },

    async requestPhone(_, phone) {
      await Vue.axios.post('/requestPhone', { phone })
    },

    async verifyEmail(_, params) {
      await Vue.axios.get(`/verifyEmail/${params.username}/${params.token}`)
    },

    async verifyPhone(_, params) {
      await Vue.axios.get(`/verifyPhone/${params.username}/${params.token}`)
    },

    async getPayments({ commit }) {
      commit('loading', true)
      let res = await apolloClient.query({
        query: paymentsQuery,
        fetchPolicy: 'network-only',
      })
      commit('loading', false)

      commit('payments', res.data.payments)
    },

    async getFriends({ commit }) {
      commit('loading', true)

      try {
        let res = await Vue.axios.get('/friends')
        commit('friends', res.data)
      } catch (e) {
        commit('error', e.response.data)
      }

      commit('loading', false)
    },

    async getChannels({ commit }) {
      let res = await Vue.axios.get('/channels')

      commit('channels', res.data.channels)
    },

    async getPeers({ commit }) {
      let res = await Vue.axios.get('/peers')

      commit('peers', res.data.peers)
    },

    async sendPayment({ commit, getters }) {
      commit('loading', true)
      commit('error', null)

      let { address, amount, payreq, payuser } = getters

      if (payreq) {
        try {
          let res = await Vue.axios.post('/sendPayment', { payreq })
          commit('payment', res.data)
        } catch (e) {
          commit('error', e.response.data)
        }
      } else if (payuser) {
        try {
          let res = await Vue.axios.post('/payUser', { payuser, amount })
          commit('payment', res.data)
        } catch (e) {
          commit('error', e.response.data)
          l(e)
        }
      } else if (address) {
        try {
          let res = await Vue.axios.post('/sendCoins', { address, amount })
          commit('payment', res.data)
        } catch (e) {
          commit('error', e.response.data)
        }
      }

      commit('loading', false)
    },

    async clearPayment({ commit }) {
      commit('loading', false)
      commit('payreq', '')
      commit('address', '')
      commit('payment', null)
      commit('payobj', null)
      commit('payuser', null)
      commit('amount', 0)
      commit('error', null)
    },

    async addInvoice({ commit }, { amount, tip, address }) {
      let res
      try {
        res = await Vue.axios.post('/addInvoice', { amount, tip, address })
        commit('payreq', res.data.payment_request)
      } catch (e) {
        commit('error', e.response.data)
      }
    },

    async scan({ commit, dispatch }) {
      commit('scanning', true)

      if (window.QRScanner) {
        window.QRScanner.prepare(err => {
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

    async handleScan({ commit, dispatch }, text) {
      await dispatch('clearPayment')
      commit('scanning', false)

      try {
        if (text.slice(0, 10) === 'lightning:') text = text.slice(10)
        let payobj = bolt11.decode(text)
        router.push({ name: 'send', params: { keep: true } })
        commit('payobj', payobj)
        commit('payreq', text)
        return
      } catch (e) {
        /**/
      }

      try {
        let url = bip21.decode(text)
        commit('address', url.address)
        commit('amount', (url.options.amount * 100000000).toFixed(0))
        let network =
          process.env.NODE_ENV !== 'production' ||
          window.location.href.includes('test')
            ? 'test3'
            : 'main'
        let res = await Vue.axios.get(
          `https://api.blockcypher.com/v1/btc/${network}/addrs/${
            url.address
          }/balance`
        )
        commit('scannedBalance', res.data.final_balance)
        router.push({ name: 'send', params: { keep: true } })
        return
      } catch (e) {
        /**/
      }

      try {
        bitcoin.address.fromBase58Check(text)
        commit('address', text)
        let network =
          process.env.NODE_ENV !== 'production' ||
          window.location.href.includes('test')
            ? 'test3'
            : 'main'
        let res = await Vue.axios.get(
          `https://api.blockcypher.com/v1/btc/${network}/addrs/${text}/balance`
        )
        commit('scannedBalance', res.data.final_balance)
        router.push({ name: 'send', params: { keep: true } })
        return
      } catch (e) {
        /**/
      }

      try {
        bech32.decode(text)
        commit('address', text)
        router.push({ name: 'send', params: { keep: true } })
        return
      } catch (e) {
        /**/
      }
    },

    async snack({ commit }, msg) {
      commit('snack', msg)
    },
  },
  mutations: {
    ...make.mutations(state),
    error(s, v) {
      s.error = v
      if (v && v.toString().includes('502 Bad'))
        s.error = 'Problem connecting to server'
    },
    token(s, v) {
      window.sessionStorage.setItem('token', v)
      Vue.axios.defaults.headers.common = { Authorization: `bearer ${v}` }
      s.token = v
    },
    user(s, v) {
      Vue.set(s, 'user', v)
    },
  },
  getters: make.getters(state),
})
