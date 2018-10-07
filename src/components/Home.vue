<template lang='pug'>
v-layout(wrap)
  v-flex(sm8 xs12)
    v-card
      v-container.request
        v-layout(wrap)
          v-flex.text-xs-center(sm6 xs12)
            canvas#qr
          v-flex(sm6 xs12).text-xs-center
            code.black--text.mt-2 {{user.address}}
            v-btn(@click="copy")
              v-icon.mr-1 content_copy
              span Copy
  v-flex(sm4).hidden-xs-only
    v-container.no-padding.ml-2
      v-layout(wrap)
        v-flex(xs12)
          v-chip(color='grey darken-3' label).white--text.subheading
            v-avatar
              img(src='static/img/bitcoin2.png')
            span {{user.balance}}
        v-flex(xs6)
          v-btn.arrow(:disabled='user.balance <= 0' @click='openChannel')
            v-icon mdi-arrow-down
        v-flex(xs6)
          v-btn.arrow(:disabled='!user.channelbalance' @click='closeChannels')
            v-icon mdi-arrow-up
        v-flex(xs12)
          v-chip(color='grey darken-3' label).white--text.subheading.fullwidth
            v-icon(left color='yellow') mdi-flash
            span {{user.channelbalance}}
  v-flex(xs12).hidden-sm-and-up
    v-container
      v-layout
        v-flex(xs6).mr-2
          v-chip(color='grey darken-3' label).white--text.subheading
            v-avatar
              img(src='static/img/bitcoin2.png')
            span {{user.balance}}
        v-flex(xs6)
          v-chip(color='grey darken-3' label).white--text.subheading.fullwidth
            v-icon(left color='yellow') mdi-flash
            span {{user.channelbalance}}
      v-layout.arrows
        v-flex(xs6).mr-2
          v-btn(:disabled='user.balance <= 0' @click='openChannel')
            v-icon mdi-arrow-right
        v-flex(xs6)
          v-btn(:disabled='!user.channelbalance' @click='closeChannels')
            v-icon mdi-arrow-left
</template>

<script>
import qr from 'qrcode'
import { mapGetters, mapActions } from 'vuex'

export default {
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
      let canvas = document.getElementById('qr')
      qr.toCanvas(canvas, this.user.address, e => { if (e) console.log(e) })
    },

    max () {
      this.funding_amt = this.user.balance
    },
  },

  mounted () {
    this.max()

    new Clipboard('.btn')
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
