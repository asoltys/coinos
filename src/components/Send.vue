<template lang="pug">
div
  v-layout
    v-flex.text-xs-center.mb-2
      span.display-2 {{user.balance}} 
      span.headline satoshi
      h3 ({{((user.balance / 100000000) * rate).toFixed(2)}} CAD @ #[span.yellow--text {{rate}}] per BTC)
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
      v-btn(@click='back') 
        v-icon arrow_back
        span Send Another
  template(v-else)
    v-textarea.mt-2(v-if='!payobj && !payuser' label='Address or Invoice:' dark v-model='to' clearable auto-grow rows='1' hide-details autofocus)
    template(v-if='address || payuser')
      numpad.mt-4(:currency='currency' :amount='parseFloat(display)' @update='updateAmount')
      span.display-1 {{amount}} 
      div
        v-btn.darken-4.subheading.grey.white--text(@click='toggle') 
          span(v-html='symbol(currency)').mr-1
          span {{conversion}} 
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
    v-btn(@click='back')
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
import Numpad from './NumPad'

export default {
  components: { Flash, Numpad },

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

  data () {
    return {
      fiat: false,
      display: 0,
    }
  },

  computed: {
    conversion () {
      if (this.fiat) return this.rate
      return parseFloat(1 / this.rate).toFixed(6)
    },
    ...mapGetters(['address', 'amount', 'fees', 'balance', 'loading', 'user', 'payment', 'payreq', 'payobj', 'payuser', 'rate']),

    currency () {
      if (this.fiat) return this.user.currency
      return 'sats'
    },

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
    updateAmount (v) {
      this.display = v
      if (this.fiat) {
        this.$store.commit('SET_AMOUNT', (v * 100000000 / this.rate).toFixed(0))
      } else {
        this.$store.commit('SET_AMOUNT', v)
      } 
    },

    symbol (v) {
      if (v === 'sats') return '$'
      return 'B'
    },

    ...mapActions(['sendPayment', 'clearPayment']),
    init () {
      if (this.clear) this.clearPayment()
      this.$store.commit('SET_PAYUSER', this.$route.query.payuser)
    },

    back () {
      this.display = 0
      if (this.payreq || this.address) return this.clearPayment()
      if (this.payuser) return this.$router.push('/contacts')
      return this.$router.push('/home')
    },
    maxamount () { this.amount = this.user.balance },
    toggle () {
      this.fiat = !this.fiat 
      if (this.fiat)
        this.display = this.display / 100000000 * this.rate
      else
        this.display = this.display * 100000000 / this.rate
    },
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
