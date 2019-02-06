<template lang="pug">
div
  v-layout
    v-flex.text-xs-center.mb-2
      span.display-2 {{user.balance}} 
      span.headline SAT
      h3 {{((user.balance / 100000000) * rate).toFixed(2)}} CAD @ #[span.yellow--text {{rate}}] per BTC
  v-card(v-if='payment')
    v-alert.headline(value='true' color='success') Payment Sent!
    v-list
      v-list-tile(v-if='payment.txid')
        v-list-tile-content
          v-list-tile-title Transaction ID
          v-list-tile-sub-title {{payment.txid}} 
        v-list-tile-action
          v-flex.text-xs-right
            v-btn(small icon ripple @click="copy(payment.txid)").mr-1
              v-icon(small) content_copy
            v-btn(small icon ripple @click='link(payment.txid)')
              v-icon(small) open_in_new
      v-list-tile
        v-list-tile-title Amount
        v-list-tile-sub-title {{total}}
      v-list-tile
        v-list-tile-title Fees
        v-list-tile-sub-title {{fees}}
    v-card-actions
      v-btn(@click='back') 
        v-icon.mr-2 arrow_back
        span Send Another
  template(v-else)
    v-textarea.my-4(v-if='!payobj && !payuser && !address' label='Address or Invoice:' dark v-model='to' clearable auto-grow rows='1' hide-details autofocus)
    v-card.elevation-1.pa-2.my-4.text-xs-center(v-if='address')
      v-layout(row wrap)
        v-flex
          .body-1.gray--text Recipient Address
          v-divider
        v-flex(xs12)
          code.black--text.mt-2 {{address}}
        v-flex(v-if='scannedBalance')
          span.display-1 &nbsp;{{scannedBalance}} 
          span SAT
    v-card.elevation-1.pa-2.my-4.text-xs-center(v-if='payuser')
      v-layout(row wrap)
        v-flex
          .body-1.gray--text Send To
        v-flex(v-if='friend' xs12)
          v-avatar
            img(:src='friend.pic')
          span.subheading.ml-2 {{friend.name}}
    template(v-if='address || payuser')
      numpad.mt-4(:currency='currency' :amount='parseFloat(display)' @update='updateAmount' @toggle='toggle')
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
    div
      v-btn(@click='back')
        v-icon arrow_back
        span Go Back
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
    keep: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      fiat: false,
      display: 0,
    }
  },

  computed: {
    friend () {
      return this.friends.find(f => f.id === this.payuser)
    },

    conversion () {
      if (this.fiat) return this.rate
      return parseFloat(1 / this.rate).toFixed(6)
    },

    ...mapGetters([
      'address',
      'amount',
      'fees',
      'friends',
      'balance',
      'loading',
      'user',
      'payment',
      'payreq',
      'payobj',
      'payuser',
      'rate',
      'scannedBalance',
    ]),

    currency () {
      if (this.fiat) return this.user.currency
      return 'sat'
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
    ...mapActions(['sendPayment', 'clearPayment', 'snack']),

    init () {
      if (!this.keep) this.clearPayment()
      if (this.$route.query.refresh !== undefined) {
        this.$router.replace(this.$route.path)
      }
      this.updateAmount(this.amount)
    },

    updateAmount (v) {
      this.display = v
      if (this.fiat) {
        this.$store.commit('amount', (v * 100000000 / this.rate).toFixed(0))
      } else {
        this.$store.commit('amount', v)
      } 
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

    link (tx) {
      let bs = 'https://blockstream.info'
      if (process.env.NODE_ENV !== 'production' || window.location.href.contains('test'))
        bs += '/testnet'
      window.location = `${bs}/tx/${tx}`
    },

    copy (tx) {
      var textArea = document.createElement('textarea')
      textArea.style.position = 'fixed'
      textArea.value = tx

      document.body.appendChild(textArea)

      textArea.focus()
      textArea.select()

      document.execCommand('copy')
      document.body.removeChild(textArea)

      this.snack('Copied to Clipboard')
    },
  },

  beforeRouteUpdate (to, from, next) {
    next()
    this.init()
  },

  mounted () {
    this.init()
    this.$store.commit('payuser', this.$route.query.payuser)
  },
}
</script>

<style lang="stylus" scoped>
  .icon
    width 40px !important

  .v-chip
    width 95%
    padding 5px

  code 
    max-width 100%
    word-wrap break-word
    font-size 1.2em
</style>
