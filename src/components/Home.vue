<template lang='pug'>
div
  v-layout
    v-flex.text-xs-center(xs12)
      v-card.pa-3.text-xs-center
        canvas#qr
        code.black--text.ma-1 {{user.address}}
        v-btn(:data-clipboard-text='user.address' @click.native="snack('Copied to Clipboard')")
          v-icon.mr-1 content_copy
          span Copy
      v-layout
        v-flex(xs5)
          v-chip(label).subheading
            v-avatar
              img(src='static/img/bitcoingray.png')
            span {{user.balance}}
        v-flex.mt-2.ml-1(xs2)
          v-icon(:disabled='!user.channelbalance' @click='closeChannels') mdi-arrow-left-bold-box
          v-icon(:disabled='user.balance <= 0' @click='openChannel') mdi-arrow-right-bold-box
        v-flex(xs5)
          v-chip(label).subheading.fullwidth
            v-icon(left color='black') mdi-flash
            span {{user.channelbalance}}
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
    ...mapGetters(['user', 'token']),
  }, 

  methods: {
    ...mapActions(['openChannel', 'closeChannels', 'getUser', 'faucet', 'snack', 'setupSockets']),
    max () {
      this.funding_amt = this.user.balance
    },
  },

  mounted () {
    this.max()

    new Clipboard('.btn')
    let canvas = document.getElementById('qr')
    qr.toCanvas(canvas, this.user.address, e => { if (e) console.log(e) })
  }, 
}
</script>

<style lang="stylus" scoped>
  .chip
    width 100%
</style>
