<template lang="pug">
    v-app(dark)#app
      v-toolbar(absolute app dark color="black" clipped-left fixed)
        v-toolbar-title(dark @click='$router.push("/home")')
          img.logo(src='static/img/coinos_logo.png')
        v-spacer
        v-btn(icon @click='$router.push("/about")')
          flash-icon(fillColor="yellow" title="About CoinOS")
        v-btn(v-if='user' icon @click='$router.push("/logout")')
          power-settings-icon(title="Logout")
      v-snackbar.yellow--text(v-model="snack" :timeout="2000" top)
        info-icon
        span {{message}}
      v-content
        v-alert(v-if='error' color='error' v-model='error' value='error' dismissible transition='scale-transition') {{error}}
        transition(name="fade" mode="out-in" appear)
          v-container.mr-3
            router-view
      v-footer
        v-bottom-nav(v-if='user' absolute style="position: relative; height: 56px; top: -72px; z-index: 6;")
          v-btn(flat dark @click="$router.push('/receive')")
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
import { mapGetters, mapActions } from 'vuex'
import FlashIcon from 'vue-material-design-icons/Flash'
import InfoIcon from 'vue-material-design-icons/Information'
import PowerSettingsIcon  from 'vue-material-design-icons/PowerSettings'
import Send from 'vue-material-design-icons/Send'
import ArrowLeft from 'vue-material-design-icons/ArrowLeftBold'

export default {
  components: { ArrowLeft, FlashIcon, InfoIcon, PowerSettingsIcon, Send },
  data () {
    return {
      applink: false,
      drawer: false,
    }
  },

  computed: {
    ...mapGetters(['user']),
    error: {
      get () { return this.$store.getters.error },
      set (v) { this.$store.commit('SET_ERROR', v) },
    },
    message: {
      get () { return this.$store.getters.snack },
      set (v) { this.$store.commit('SET_SNACK', v) },
    },
    snack: {
      get () { return this.message },
      set (v) { if (!v) this.message = v },
    },
  }, 

  watch: {
    $route (route) {
      this.$store.commit('SET_ERROR', '')
      this.authenticate(route)
    },
  },

  methods: {
    ...mapActions(['init', 'handleScan']),

    addEvent (object, type, callback) {
      if (object == null || typeof(object) == 'undefined') return
      if (object.addEventListener) {
        object.addEventListener(type, callback, false)
      } else if (object.attachEvent) {
        object.attachEvent('on' + type, callback)
      } else {
        object['on' + type] = callback
      }
    },

    scantest () {
      // this.handleScan('lntb15920n1pdfv5mqpp5ygalsdx3g0q24t8sgqv3lwcw8a64c4cejrnqftluljcg5v7x03qsdqqcqzysjgtcyyg03ukffsk29u77a2pgp9jw2f5xsj3q2wnteph62jwk5gj9gs6k8qc467s3d5h58d6gshhk9g7v8axyl4hg6eucv3vk7v2zxpcq8e4222')
      // this.handleScan('2Mtibx7fn88YYY8agCKUECvQL1Wys8P7juo')
      this.handleScan('bitcoin:2Mtibx7fn88YYY8agCKUECvQL1Wys8P7juo?amount=0.005&label=Foobar')
    },

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

    authenticate (route) {
      const publicpaths = ['/login', '/about', '/register']
      if (!publicpaths.includes(route.path) && !this.user) {
        this.$router.push('/login')
      }
    },
  },

  async created () {
    await this.init()
    this.authenticate(this.$route)

    let elem = document.documentElement

    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen()
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen()
    }
  },
}
</script> 

<style lang="stylus">
  @media all and (orientation:portrait), (min-width: 800px)
    .portrait
      display block
    .landscape
      display none
    #app
      max-width 768px

  @media all and (orientation:landscape) and (max-width: 1024px)
    .portrait
      display none
    .landscape
      display block
    #app
      max-width 1024px 

.input-group--focused label
  color white !important

.toolbar__title
  cursor pointer

.fade-transition
  &-leave-active
    position: absolute
 
  &-enter-active, &-leave, &-leave-to
    transition: $primary-transition
 
  &-enter, &-leave-to
    opacity: 0

img.logo
  cursor pointer
  max-height 40px

img.fx
  width 30px
  height 30px

.fade-enter-active
  transition: opacity 0.3s

.fade-enter
  opacity: 0

#app 
  margin auto
  box-shadow 0 0 0 9999px rgba(20, 20, 20, 1)

body 
  background #222
</style>
