<template lang="pug">
  div
    v-progress-linear(v-if='loading' indeterminate)
    template(v-else-if='generated')
      template(v-if='received')
        v-alert(value='received' color='success') Received {{received}} Satoshis
      v-layout(v-else)
        v-flex(xs12)
          h2.text-xs-center Requesting {{total}} Satoshis
          v-card.pa-3.text-xs-center
            div.code(v-if='showcode') {{copytext}}
            canvas#qr(v-show='!showcode' width='100' height='100')
            v-btn(@click.native="showcode = !showcode")
              v-icon code
              span {{code}}
            v-btn(@click.native="copy")
              v-icon content_copy
              span Copy
      v-btn(@click='generated = false; amount = 0') 
        v-icon.mr-1 arrow_back
        span Back
    template(v-else)
      v-layout
        v-flex(xs9 sm6)
          numpad(:currency='currency' :amount='parseFloat(amount)' @update='a => amount = a')
        v-flex(xs3 sm6)
          tippad(:amount='parseFloat(amount)' @update='t => tip = t')
      v-layout
        v-flex
          span.display-1 {{total}} 
          span.title sats
        v-flex.text-xs-right
          v-btn.darken-4.subheading.grey.white--text(@click='toggle' style='width: 120px') 
            span(v-html='symbol(currency)').mr-1
            span {{conversion}} 
      v-layout
        v-flex.text-xs-center(xs6)
          v-btn(@click='bitcoin' :disabled='total <= 0') 
            img(src='static/img/bitcoin2.png' width='30px').mr-1
            span Bitcoin
        v-flex.text-xs-center(xs6)
          v-btn(@click='lightning' :disabled='total <= 0') 
            flash(fillColor='yellow')
            span Lightning
</template>

<script>
import qr from 'qrcode'
import Numpad from './NumPad'
import Tippad from './TipPad'
import { mapGetters, mapActions } from 'vuex'
import  Flash from 'vue-material-design-icons/Flash'

const f = parseFloat

export default {
  components: { Flash, Numpad, Tippad },

  filters: {
  },

  data () {
    return {
      message: '',
      about: '',
      amount: 0,
      tip: 0,
      generated: false,
      showcode: false,
      finished: false,
      fiat: true,
      bitreq: '',
    }
  },

  computed: {
    ...mapGetters(['loading', 'user', 'payreq', 'rate', 'received']),

    tosats () { return this.currency === 'sats' ? 1 : 100000000 },
    copytext () { return this.bitreq || this.payreq },
    code () { return this.showcode ? 'Show QR' : 'Show Code' }, 
    total () {
      let total = (f(this.amount) + f(this.tip))
      console.log(this.amount, total)
      if (this.fiat) total /= this.rate
      return (total * this.tosats).toFixed(0)
    },

    currency () {
      if (this.fiat) return this.user.currency
      return 'sats'
    },

    conversion () {
      if (this.fiat) return this.rate
      return parseFloat(1 / this.rate).toFixed(6)
    },
  },

  methods: {
    ...mapActions(['addInvoice', 'getRates', 'snack', 'clearPayment']),

    copy () {
      var textArea = document.createElement('textarea')
      textArea.style.position = 'fixed'
      textArea.value = this.copytext

      document.body.appendChild(textArea)

      textArea.focus()
      textArea.select()

      document.execCommand('copy')
      document.body.removeChild(textArea)

      this.snack('Copied to Clipboard')
    },


    symbol (v) {
      if (v === 'sats') return '$'
      return 'B'
    },

    toggle () {
      this.fiat = !this.fiat 
      console.log(this.fiat, this.amount, this.rate)
      if (this.fiat)
        this.amount = this.amount / 100000000 * this.rate
      else
        this.amount = this.amount * 100000000 / this.rate
    },

    timeout (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },

    bitcoin () {
      this.$store.commit('SET_LOADING', true)
      this.generated = true
      this.$store.commit('SET_RECEIVED', 0)
      this.$nextTick(async () => {
        await this.timeout(200)
        this.$store.commit('SET_LOADING', false)
        this.$nextTick(() => {
          let canvas = document.getElementById('qr')
          if (!canvas) return
          this.bitreq = `bitcoin:${this.user.address}?amount=${this.total / 100000000}`
          qr.toCanvas(canvas, this.bitreq, e => { if (e) console.log(e) })
        })
      })
    },

    lightning () {
      this.bitreq = null
      this.$store.commit('SET_LOADING', true)
      this.generated = true
      this.$store.commit('SET_RECEIVED', 0)
      this.$nextTick(async () => {
        await this.addInvoice({ amount: this.total, tip: this.tip })
        await this.timeout(200)
        this.$store.commit('SET_LOADING', false)
        this.$nextTick(() => {
          let canvas = document.getElementById('qr')
          if (!canvas) return
          qr.toCanvas(canvas, this.payreq, e => { if (e) console.log(e) })
        })
      })
    },

    finish () {
      this.finished = true
    },
  },

  async mounted () {
    this.$store.commit('SET_LOADING', true)
    this.$store.commit('SET_RECEIVED', 0)
    new Clipboard('.btn')
    await this.getRates()
    await this.timeout(50)
    this.$nextTick(() => this.$store.commit('SET_LOADING', false))
  },
}
</script>

<style lang="stylus" scoped>
  canvas
    position relative
    display block
    height 100%
    margin-left auto
    margin-right auto

  .code
    margin auto
    width 260px
    height 260px
    background #333
    word-wrap break-word
    padding 15px
</style>

