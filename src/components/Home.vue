<template lang='pug'>
div.text-xs-center
  v-flex.mb-2
    span.display-2 {{animatedBalance}} 
    span.headline SAT
    h3 {{((animatedBalance / 100000000) * animatedRate).toFixed(2)}} CAD @ #[span.yellow--text {{animatedRate}}] per BTC
    div(v-if='user.pending').yellow--text.text--lighten-3
      span.display-2 {{animatedPending}} 
      span.headline pending
      h3 {{((animatedPending / 100000000) * animatedRate).toFixed(2)}} CAD
  v-flex(xs12)
    v-card
      v-container.request
        v-layout(wrap)
          v-flex.text-xs-center#canvas-container(xs12)
            canvas#qr(@click='fullscreen')
          v-flex(xs12).text-xs-center
            div
              code.black--text.mt-2 {{user.address}}
            v-btn(@click="copy")
              v-icon.mr-1 content_copy
              span Copy
  div.mx-auto
    v-btn.mr-2(v-if='user.fbtoken' @click="$router.push('/contacts')") 
      v-icon.mr-1 person
      span Address Book
    v-btn(v-if='user.limit > 0' @click="$router.push('/buy')")
      v-icon.mr-1 credit_card
      span Add Funds
</template>

<script>
import qr from 'qrcode'
import { mapGetters, mapActions } from 'vuex'
import ArrowDown from 'vue-material-design-icons/ArrowDownBold'
import ArrowUp from 'vue-material-design-icons/ArrowUpBold'
import ArrowLeft from 'vue-material-design-icons/ArrowLeftBold'
import ArrowRight from 'vue-material-design-icons/ArrowRightBold'
import Flash from 'vue-material-design-icons/Flash'
import { TweenLite } from 'gsap'

export default {
  components: { ArrowDown, ArrowUp, ArrowLeft, ArrowRight, Flash },

  data () {
    return {
      tweenedBalance: null,
      tweenedPending: null,
      tweenedRate: null,
      full: false,
      playing: false,
      received: 0,
      funding_amt: 0,
    }
  },

  computed: {
    ...mapGetters(['fbtoken', 'rate', 'user']),
    animatedBalance () { return parseInt(this.tweenedBalance).toFixed(0) },
    animatedPending () { return parseInt(this.tweenedPending).toFixed(0) },
    animatedRate () { return parseFloat(this.tweenedRate).toFixed(2) },
  }, 

  watch: {
    rate (rate) {
      let tweenedRate = rate
      TweenLite.to(this.$data, 0.5, { tweenedRate })
    },

    user: {
      handler (user) {
        let tweenedBalance = user.balance
        let tweenedPending = user.pending

        if (user.pending === 0) user.pending = null

        TweenLite.to(this, 0.5, { tweenedBalance })
        TweenLite.to(this, 0.5, { tweenedPending })
        
        this.tweenedBalance = 0
        this.pendingBalance = 0

        this.drawQR()
      },
      deep: true,
    },
  },

  methods: {
    ...mapActions(['snack']),

    copy () {
      var textArea = document.createElement('textarea')
      textArea.style.position = 'fixed'
      textArea.value = this.user.address

      document.body.appendChild(textArea)

      textArea.focus()
      textArea.select()

      document.execCommand('copy')
      document.body.removeChild(textArea)

      this.snack('Copied to Clipboard')
    },

    drawQR () {
      if (!this.user.address) return
      let canvas = document.querySelector('#qr')
      qr.toCanvas(canvas, this.user.address, e => { if (e) console.log(e) })
      canvas.style.width = '25vh'
      canvas.style.height = '25vh'
      canvas.style.cursor = 'pointer'
    },

    fullscreen () {
      let canvas = document.getElementById('qr')

      if (this.full) {
        canvas.style.position = 'relative'
        canvas.style.width = '25vh'
        canvas.style.height = '25vh'
        canvas.style.left = 0
        document.querySelector('#canvas-container').appendChild(canvas)
        this.full = false
        return
      }

      canvas.style.position = 'absolute'
      canvas.style.top = 0
      canvas.style.left = ((window.innerWidth / 2) - Math.min(window.innerWidth, window.innerHeight) / 2) + 'px'
      canvas.style.width = canvas.style.height = Math.min(window.innerWidth, window.innerHeight) + 'px'
      canvas.style.zIndex = 9999
      document.querySelector('body').appendChild(canvas)
      this.full = true
    }, 

    max () {
      this.funding_amt = this.user.balance
    },
  },

  mounted () {
    this.max()
    this.drawQR()
  }, 

  created () {
    this.tweenedBalance = this.user.balance
    this.tweenedPending = this.user.pending
    this.tweenedRate = this.rate
  },
}
</script>

<style lang="stylus" scoped>
  code 
    max-width 100%
    word-wrap break-word
    font-size 0.9em

  .v-chip
    padding 5px
    width 100%
    margin 0

  .container.no-padding
    padding 0 !important

  .arrows .v-btn
    margin 0
    margin-top 8px
    width 100%

  .arrow
    margin 8px 0

  .request
    padding 8 0
</style>
