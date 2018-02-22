<template lang="pug">
v-container
  h2 Balance: {{user.channelbalance}}
  v-card(v-if='payment')
    v-alert.headline(value='true' color='success') Payment Sent!
    v-list
      v-list-tile
        v-list-tile-title Amount
        v-list-tile-sub-title {{payment.payment_route.total_amt}}
      v-list-tile
        v-list-tile-title Fees
        v-list-tile-sub-title {{payment.payment_route.total_fees}}
    v-card-actions
      v-btn(@click='clear') 
        v-icon mdi-flash
        span Send Another
  template(v-else)
    v-text-field(label='Invoice' dark v-model='payreq' @input='decode')
    v-list.elevation-1(v-if='payobj')
      v-list-tile
        v-list-tile-title Amount
        v-list-tile-sub-title {{payobj.satoshis}}
      v-list-tile
        v-list-tile-title Recipient
        v-list-tile-sub-title {{payobj.payeeNodeKey | trim}}
      v-list-tile
        v-list-tile-title Date
        v-list-tile-sub-title {{payobj.timestampString | format}}
    v-btn(@click='scan')
      v-icon.mr-1 camera_alt
      span Scan
    v-btn(v-if='payobj' color="green" dark @click='send')
      v-icon.mr-1 send
      span Pay
</template>

<script>
import Lightning from './Lightning'
import { mapGetters, mapActions } from 'vuex'
import payreq from 'bolt11'
import date from 'date-fns'
import socketio from 'socket.io-client'

export default {
  components: { Lightning },

  filters: {
    trim (w) {
      return w.substring(0, 12)
    },

    format (d) {
      return date.format(d, 'MMM D, YYYY HH:mm')
    } 
  },

  data () {
    return {
      payreq: '',
      payobj: '',
    }
  },

  computed: {
    ...mapGetters(['balance', 'user', 'payment'])
  }, 

  methods: {
    clear () {
      this.payreq = ''
      this.clearPayment()
    },

    decode () {
      this.payobj = null
      try { 
        this.payobj = payreq.decode(this.payreq)
      } catch (e) {}
    },

    async send () {
      await this.sendPayment(this.payreq)
    },

    paste () {
      console.log('not implemented')
    },

    scan () {
      if (typeof window.QRScanner !== 'undefined') {
        window.QRScanner.prepare((err, status) => {
          if (err) {
            console.error(err)
            return
          } 

          window.QRScanner.show((status) => {
            document.querySelector('.application').style.display = 'none'
            window.QRScanner.scan((err, text) => {
              if (err) { 
                console.log(err) 
              } else {
                this.payreq = text
                this.decode()
              }

              document.querySelector('.application').style.display = 'block'
              window.QRScanner.hide()
            })
          })
        })
      } 
    },

    ...mapActions(['sendPayment', 'clearPayment']),
  },

  mounted () {
    let vm = this
    this.clearPayment()

    if (typeof cordova !== 'undefined') {
      console.log('listening for nfc')
      console.log(window.nfc)
      window.nfc.addTagDiscoveredListener(e => { console.log('tap detected', e) })
    }
  },
}
</script>

<style lang="stylus">
  .icon
    width 40px !important
</style>
