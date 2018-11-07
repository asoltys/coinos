<template lang="pug">
v-footer
  v-bottom-nav(v-if='user' absolute).bottom-nav
    v-btn(flat dark @click="$router.push('/receive/' + Math.floor(Math.random() * 10000))")
      span Receive
      arrow-left
    v-btn(v-if='native()' flat dark @click="scan")
      span Scan
      v-icon camera_alt
    v-btn(v-else flat dark @click="$router.push('/payments')")
      span Payments
      v-icon assignment 
    v-btn(flat dark @click="$router.push('/home')")
      span Home
      v-icon home
    v-btn(flat dark @click="$router.push('/send')")
      span Send
      send
</template>

<script>
import Send from 'vue-material-design-icons/Send'
import ArrowLeft from 'vue-material-design-icons/ArrowLeftBold'
import { mapGetters } from 'vuex'

export default {
  components: { ArrowLeft, Send },

  computed: mapGetters(['user']),

  methods: {
    native () {
      return typeof window.cordova !== 'undefined'
    },

    scan () {
      if (typeof window.QRScanner !== 'undefined') {
        window.QRScanner.prepare((err) => {
          if (err) {
            console.error(err)
            return
          } 

          window.QRScanner.show(() => {
            document.querySelector('#app').style.display = 'none'
            document.querySelector('#camcontrols').style.display = 'block'
            window.QRScanner.scan((err, res) => {
              if (err) { 
                console.log(err) 
              } else {
                this.handleScan(res)
              }

              document.querySelector('#app').style.display = 'block'
              document.querySelector('#camcontrols').style.display = 'none'
              window.QRScanner.hide()
            })
          })
        })
      } 
    },
  },
} 
</script>

<style lang="stylus" scoped>
  .bottom-nav
    position relative 
    height 56px 
    top -72px 
    z-index 6
</style>
