<template lang="pug">
div
  v-layout
    v-flex.text-xs-center.mb-2
      span.display-2 {{user.balance}} 
      span.headline satoshi
      h3 ({{((user.balance / 100000000) * rate).toFixed(2)}} CAD)
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
      v-btn(@click='init') 
        v-icon arrow_back
        span Send Another
  template(v-else)
    v-textarea.mt-2(v-if='!payobj && !$route.query.to' label='Address or Invoice:' dark v-model='to' clearable auto-grow rows='1' hide-details autofocus)
    v-text-field.mt-4(v-if='address || $route.query.to' label='Amount:' dark v-model='amount' autofocus)
      v-btn(slot='append' @click='maxamount') Max
    v-list.elevation-1.ma-2(v-if='payobj')
      v-list-tile
        v-list-tile-title Amount
        v-list-tile-sub-title {{payobj.satoshis}}
      v-list-tile
        v-list-tile-title Recipient
        v-list-tile-sub-title {{payobj.payeeNodeKey}}
      v-list-tile
        v-list-tile-title Date
        v-list-tile-sub-title {{payobj.timestampString | format}}
    v-btn(v-if='payobj' @click='clearPayment')
      v-icon arrow_back
      span Back
    v-progress-linear(v-if='loading' indeterminate)
    v-btn(v-else-if='to' color="green" dark @click='sendPayment')
      v-icon.mr-1 send
      span Pay
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import date from 'date-fns'
import Flash from 'vue-material-design-icons/Flash'

export default {
  components: { Flash },

  filters: {
    trim: w => w.substring(0, 12),
    format: d => date.format(d, 'MMM D, YYYY HH:mm'),
  },

  props: {
    clear: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    ...mapGetters(['address', 'fees', 'balance', 'loading', 'user', 'payment', 'payreq', 'payobj', 'payuser', 'rate']),

    total () {
      let p = this.payment
      if (p) {
        if (p.payment_route) return p.payment_route.total_amt - p.payment_route.total_fees
        return p.amount
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
        if (this.payuser) return this.payuser
      },
      set (v) {
        if (!v) v = ''
        this.$store.dispatch('handleScan', v.trim())
      },
    }, 
  }, 

  methods: {
    ...mapActions(['sendPayment', 'clearPayment']),
    init () {
      if (this.clear) this.clearPayment()
      this.$store.commit('SET_PAYUSER', this.$route.query.to)
    },
    maxamount () { this.amount = this.user.balance },
  },

  mounted () {
    this.init()
  },
}
</script>

<style lang="stylus" scoped>
  .icon
    width 40px !important

  .v-chip
    width 95%
    padding 5px
</style>
