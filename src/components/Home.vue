<template lang='pug'>
v-layout(wrap)
  v-flex(xs12).portrait
    v-card
      v-container.request
        v-layout(wrap)
          v-flex.text-xs-center(md6 xs12)
            h2 Deposit Bitcoin
            canvas.qr
          v-flex(md6 xs12).text-xs-center
            div
              code.black--text.mt-2 {{user.address}}
            v-btn(@click="copy")
              v-icon.mr-1 content_copy
              span Copy
  v-flex(xs8).landscape
    v-card
      v-container.request
        v-layout(wrap)
          v-flex.text-xs-center(xs6)
            h2 Deposit Bitcoin
            canvas.qr
          v-flex(xs6).text-xs-center
            code.black--text.mt-2 {{user.address}}
            v-btn(@click="copy")
              v-icon.mr-1 content_copy
              span Copy
  v-flex(xs4).landscape
    v-container.no-padding.ml-2
      v-layout(wrap)
        v-flex(xs12)
          v-chip(color='grey darken-3' label).white--text.subheading
            v-avatar
              img(src='static/img/bitcoin2.png')
            span {{user.balance}}
        v-flex(xs6)
          v-btn.arrow(:disabled='user.balance <= 0' @click='openChannel')
            arrow-down
        v-flex(xs6)
          v-btn.arrow(:disabled='!user.channelbalance' @click='closeChannels')
            arrow-up
        v-flex(xs12)
          v-chip(color='grey darken-3' label).white--text.subheading.fullwidth
            flash(fillColor='yellow')
            span {{user.channelbalance}}
  v-flex(xs12).portrait
    v-container
      v-layout
        v-flex(xs6).mr-2
          v-chip(color='grey darken-3' label).white--text.subheading
            v-avatar
              img(src='static/img/bitcoin2.png')
            span {{user.balance}}
        v-flex(xs6)
          v-chip(color='grey darken-3' label).white--text.subheading.fullwidth
            flash(fillColor='yellow')
            span {{user.channelbalance}}
      v-layout.arrows
        v-flex(xs6).mr-2
          v-btn(:disabled='user.balance <= 0' @click='openChannel')
            span Open
            arrow-right
        v-flex(xs6)
          v-btn(:disabled='!user.channelbalance' @click='closeChannels')
            arrow-left
            span Close
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
      let canvas = document.querySelector('.qr')
      qr.toCanvas(canvas, this.user.address, e => { if (e) console.log(e) })
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
