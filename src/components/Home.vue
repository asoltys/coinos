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
        v-btn(@click='faucet' :disabled='user.balance > 200000 || user.channelbalance > 300000')
          v-icon.mr-1(color='blue') mdi-water-pump
          span Faucet
      v-layout
        v-flex(xs5)
          v-text-field(label='Regular Balance' v-model='user.balance' disabled)
        v-flex(xs7)
          v-btn(v-if='user.balance > 0' @click='openChannel')
            v-icon(color='yellow') mdi-flash
            span Open Channel
      v-layout
        v-flex(xs5)
          v-text-field(label='Lightning Balance' disabled :value='user.channelbalance')
        v-flex(xs7)
          v-btn(v-if='user.channelbalance' @click='closeChannels')
            v-icon(color='red') mdi-flash-off
            span Close Channel
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
    ...mapActions(['openChannel', 'closeChannels', 'getUser', 'faucet', 'snack']),
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
