<template lang='pug'>
div.text-xs-center
  v-flex.mb-2
    span.display-2 {{user.balance}} 
    span.headline satoshi
    h3 ({{((user.balance / 100000000) * rate).toFixed(2)}} CAD)
  v-flex(xs12)
    v-card
      v-container.request
        v-layout(wrap)
          v-flex.text-xs-center(xs12)
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

export default {
  components: { ArrowDown, ArrowUp, ArrowLeft, ArrowRight, Flash },

  data () {
    return {
      full: false,
      playing: false,
      received: 0,
      funding_amt: 0,
    }
  },

  computed: {
    ...mapGetters(['fbtoken', 'rate', 'user']),
  }, 

  watch: {
    user () {
      this.drawQR()
    },
  },

  methods: {
    ...mapActions(['getRates', 'snack']),

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
      if (this.full) {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
        this.full = false
        return
      }

      let elem = document.getElementById('qr')

      if (elem.requestFullscreen) {
        elem.requestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen()
      }

      this.full = true
    }, 

    max () {
      this.funding_amt = this.user.balance
    },
  },

  mounted () {
    this.max()
    this.drawQR()
    this.getRates()
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
