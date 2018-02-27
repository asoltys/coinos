<template lang='pug'>
div
  h2 Deposit
  v-layout
    v-flex.text-xs-center(xs12)
      v-card.pa-3.text-xs-center
        canvas#qr
        code.primary--text.ma-1 {{user.address}}
        v-btn(:data-clipboard-text='user.address' @click.native="snackbar = true")
          v-icon.mr-1 content_copy
          span Copy
        v-btn(@click='faucet')
          v-icon.mr-1 mdi-water-pump
          span Faucet
      v-layout
        v-flex(xs6)
          v-text-field(label='Regular Balance' v-model='user.balance' disabled)
        v-flex(xs6)
          v-btn(v-if='user.balance > 0' @click='openChannel')
            v-icon(color='yellow') mdi-flash
            span Electrify
      v-layout
        v-flex(xs6)
          v-text-field(label='Lightning Balance' disabled :value='user.channelbalance')
        v-flex(xs6)
          v-btn(@click='closeChannels' :disabled='!user.channelbalance')
            span Close Channels
</template>

<script>
import bitcoin from 'bitcoinjs-lib'
import socketio from 'socket.io-client'
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

  methods: {
    ...mapActions(['openChannel', 'closeChannels', 'getUser', 'faucet']),
    max () {
      this.funding_amt = this.user.balance
    },
  },

  mounted () {
    const io = socketio(process.env.SOCKETIO)
    const vm = this
    this.max()

    io.on('tx', async data => {
      await vm.getUser() 
      console.log(data, vm.user)
    })

    new Clipboard('.btn')
    let canvas = document.getElementById('qr')
    qr.toCanvas(canvas, this.user.address, e => { if (e) console.log(e) })
  } 
} 
</script>
