<template lang="pug">
v-container
  h3 Balances
  v-chip.body-2(label)
    v-icon(left) assignment
    | {{user.balance}}
  v-chip.body-2(label)
    v-icon(left) mdi-flash
    | {{user.channelbalance}}
  v-card(v-if='payment')
    v-alert.headline(value='true' color='success') Payment Sent!
    v-list
      v-list-tile
        v-list-tile-title Amount
        v-list-tile-sub-title {{payment.payment_route.total_amt}}
      v-list-tile
        v-list-tile-title Fees
        v-list-tile-sub-title {{payment.payment_route.total_fees}}
    v-card-actions
      v-btn(@click='clear') 
        v-icon mdi-flash
        span Send Another
  template(v-else)
    v-text-field(label='To:' dark v-model='to' clearable multi-line rows='2')
    v-text-field(v-if='address' label='Amount:' dark v-model='amount')
    v-text-field(v-if='address' label='Fees:' dark v-model='fees')
    v-list.elevation-1(v-if='payobj')
      v-list-tile
        v-list-tile-title Amount
        v-list-tile-sub-title {{payobj.satoshis}}
      v-list-tile
        v-list-tile-title Recipient
        v-list-tile-sub-title {{payobj.payeeNodeKey | trim}}
      v-list-tile
        v-list-tile-title Date
        v-list-tile-sub-title {{payobj.timestampString | format}}
    v-btn(color="green" dark @click='send')
      v-icon.mr-1 send
      span Pay
</template>

<script>
import Lightning from './Lightning'
import { mapGetters, mapActions } from 'vuex'
import date from 'date-fns'
import socketio from 'socket.io-client'

export default {
  components: { Lightning },

  filters: {
    trim (w) {
      return w.substring(0, 12)
    },

    format (d) {
      return date.format(d, 'MMM D, YYYY HH:mm')
    } 
  },

  computed: {
    ...mapGetters(['address', 'amount', 'fees', 'balance', 'user', 'payment', 'payreq', 'payobj']),

    to: {
      get () {
        if (this.payreq) return this.payreq
        if (this.address) return this.address
      },
      set (v) {
        this.$store.dispatch('handleScan', v)
      } 
    }, 
  }, 

  methods: {
    clear () {
      this.$store.commit('SET_PAYREQ', '')
      this.clearPayment()
    },

    async send () {
      await this.sendPayment(this.payreq)
    },

    ...mapActions(['sendPayment', 'clearPayment']),
  },

  mounted () {
    let vm = this
    this.clearPayment()

    if (typeof cordova !== 'undefined') {
      console.log('listening for nfc')
      console.log(window.nfc)
      window.nfc.addTagDiscoveredListener(e => { console.log('tap detected', e) })
    }
  },
}
</script>

<style lang="stylus">
  .icon
    width 40px !important
</style>
