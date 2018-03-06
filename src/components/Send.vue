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
      v-list-tile(v-if='payment.txid')
        v-list-tile-title Transaction ID
        v-list-tile-sub-title {{payment.txid}}
      v-list-tile
        v-list-tile-title Amount
        v-list-tile-sub-title {{total}}
      v-list-tile
        v-list-tile-title Fees
        v-list-tile-sub-title {{fees}}
    v-card-actions
      v-btn(@click='clearPayment') 
        v-icon arrow_back
        span Send Another
  template(v-else)
    v-text-field.mt-2(label='To:' dark v-model='to' clearable multi-line auto-grow rows='1' hide-details autofocus)
    v-text-field.mt-4(v-if='address' label='Amount:' dark v-model='amount' autofocus)
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
    v-btn(color="green" dark @click='sendPayment')
      v-icon.mr-1 send
      span Pay
</template>

<script>
import Lightning from './Lightning'
import { mapGetters, mapActions } from 'vuex'
import date from 'date-fns'

export default {
  components: { Lightning },

  filters: {
    trim: w => w.substring(0, 12),
    format: d => date.format(d, 'MMM D, YYYY HH:mm'),
  },

  computed: {
    ...mapGetters(['address', 'fees', 'balance', 'user', 'payment', 'payreq', 'payobj']),

    total () {
      let p = this.payment
      if (p) {
        if (p.payment_route) return p.payment_route.total_amt
        return p.total
      }
      return 0
    },

    fees () {
      let p = this.payment
      if (p) {
        if (p.payment_route) return p.payment_route.total_fees
        return p.fees
      }
      return 0
    },

    amount: {
      get () { return this.$store.getters.amount },
      set (v) { this.$store.commit('SET_AMOUNT', v) },
    },

    to: {
      get () {
        if (this.payreq) return this.payreq
        if (this.address) return this.address
      },
      set (v) {
        if (!v) v = ''
        this.$store.dispatch('handleScan', v.trim())
      },
    }, 
  }, 

  methods: {
    ...mapActions(['sendPayment', 'clearPayment']),
  },

  mounted () {
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
