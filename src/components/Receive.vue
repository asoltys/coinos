<template lang="pug">
  div
    HCE(:accountNumber='total')
    v-snackbar(:bottom="true" v-model="snackbar" :timeout="1500")
      v-icon info
      span Copied to Clipboard
    template(v-if='generated')
      template(v-if='received')
        video(v-if='!finished' width='100%' ref='connect' @ended='finish')
          source(src="static/connect.mp4" type="video/mp4")
        v-alert(value='received' color='success') Received {{received}} satoshis
      v-layout(v-else)
        v-flex(xs12)
          h2.text-xs-center.yellow--text Requesting {{total}} Satoshis
          v-card.pa-3.text-xs-center
            div.code(v-if='showcode') {{payreq}}
            canvas#qr(v-show='!showcode')
            v-btn(@click.native="showcode = !showcode")
              v-icon code
              span {{code}}
            v-btn(:data-clipboard-text='payreq' @click.native="snackbar = true")
              v-icon content_copy
              span Copy
      v-btn(@click='generated = false; amount = 0') 
        v-icon.mr-1 arrow_back
        span Back
    template(v-else)
      v-layout(style="max-width: 340px")
        v-flex(xs9)
          numpad(:currency='user.currency', :amount='amount', @update='a => amount = a')
        v-flex(xs3)
          tippad(:amount='parseInt(amount)', @update='t => tip = t')
      div(v-if='valid')
        span.display-1 {{total}} 
        span.title satoshis
        v-layout
          v-flex.text-xs-center(xs12)
            v-btn(@click='generate') 
              v-icon.mr-1.yellow--text mdi-flash
              span GO
      v-alert(v-else value='!valid') Can't request more than 0.04294967 BTC
</template>

<script>
import axios from 'axios'
import qr from 'qrcode'
import numpad from './NumPad'
import tippad from './TipPad'
import HCE from './HCE'
import Lightning from './Lightning'
import { mapGetters, mapActions } from 'vuex'

const f = parseFloat

export default {
  components: { numpad, tippad, HCE, Lightning },

  data () {
    return {
      message: '',
      about: '',
      amount: 0,
      tip: 0,
      rate: 0,
      address: '1234',
      timeout: null,
      snackbar: false,
      generated: false,
      showcode: false,
      finished: false,
    }
  },

  computed: {
    ...mapGetters(['user', 'payreq', 'received']),

    code () {
      return this.showcode ? 'Show QR' : 'Show Code'
    }, 

    total () {
      this.$store.commit('SET_RECEIVED', 0)
      let total = (f(this.amount) + f(this.tip)) / this.rate
      return parseInt(total * 100000000)
    },

    valid () {
      return this.total < 4294967
    },
  },

  watch: {
    received () {
      this.finished = false
      this.$nextTick(() => this.$refs.connect.play())
    },
  },

  methods: {
    async generate () {
      this.$store.commit('SET_RECEIVED', 0)
      this.generated = true
      await this.addInvoice(this.total)
      let canvas = document.getElementById('qr')
      qr.toCanvas(canvas, this.payreq, e => { if (e) console.log(e) })
    },

    async loadWallet () {
      let rates = await axios('/rates')
      this.rate = rates.data.ask
    },

    finish () {
      this.finished = true
    },

    ...mapActions(['addInvoice']),
  },
  mounted () {
    new Clipboard('.btn')
    this.loadWallet()
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

  [v-cloak]
    display none
</style>

