<template lang='pug'>
v-layout(wrap)
  v-flex(xs12)
    v-card
      v-container.request
        v-layout(wrap)
          v-flex.text-xs-center(xs12)
            h2 Deposit Bitcoin
            canvas#qr(@click='fullscreen')
          v-flex(xs12).text-xs-center
            div
              code.black--text.mt-2 {{user.address}}
            v-btn(@click="copy")
              v-icon.mr-1 content_copy
              span Copy
  v-flex(xs12)
    v-container
      v-layout
        v-flex
          h1 Balance
          v-chip(color='grey darken-3' label).white--text.subheading
            v-avatar
              img(src='../assets/bitcoin.png')
            span {{user.balance}}
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
    ...mapGetters(['user']),
  }, 

  watch: {
    user () {
      this.drawQR()
    },
  },

  methods: {
    ...mapActions(['openChannel', 'closeChannels', 'faucet', 'snack', 'setupSockets']),

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
      canvas.style.width = '35vh'
      canvas.style.height = '35vh'
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
  }, 
}
</script>

<style lang="stylus" scoped>
  code 
    max-width 90%
    word-wrap break-word
    font-size 1.5em

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
