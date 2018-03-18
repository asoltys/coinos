<template lang="pug">
  v-app(@mask='setMasks')
    v-toolbar(absolute app color="white" clipped-left fixed)
      v-toolbar-side-icon(v-if='user' @click.stop='toggleMenu')
      v-toolbar-title(@click='$router.push("/")')
        | Bestie
      v-spacer
      v-btn(icon @click='$router.push("/about")')
        v-avatar
          img.logo(src='static/img/sausage.svg')
      v-btn(v-if='user' icon @click='$router.push("/logout")')
        v-icon power_settings_new
    v-snackbar.yellow--text(v-model="snack" :timeout="2000" top)
      v-icon info
      span {{message}}
    v-content.pl-3.pr-3.mt-3
      v-navigation-drawer(color='black' v-if='user' v-model='drawer' enable-resize-watcher app clipped absolute hide-overlay mobile-break-point='10000' width='200')
        v-list.secondary
          template(v-for='i in menu') 
            v-list-tile(:key='i.route' ripple @click='$router.push(i.route)')
              v-list-tile-action
                v-btn(icon ripple)
                  v-icon {{i.icon}}
              v-list-tile-content {{i.content}}
      v-alert(v-if='error' color='error' v-model='error' value='error' dismissible transition='scale-transition') {{error}}
      transition(name="fade" mode="out-in" appear)
        router-view
    v-footer(app)
      v-bottom-nav(v-if='user' absolute style="height: 56px; margin-bottom: 56px")
        v-btn(flat @click="$router.push('/receive')")
          span Receive
          v-icon mdi-arrow-left-bold-box
        v-btn(v-if='native()' flat @click="scan")
          span Scan
          v-icon camera_alt
        v-btn(v-else flat @click="$router.push('/payments')")
          span Payments
          v-icon assignment 
        v-btn(flat @click="$router.push('/home')")
          span Home
          v-icon home
        v-btn(flat @click="$router.push('/send')")
          span Send
          v-icon mdi-send
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data () {
    return {
      applink: false,
      drawer: false,
      menu: [
        { route: 'home', content: 'Home', icon: 'assignment_returned' },
        { route: 'send', content: 'Send', icon: 'mdi-send' },
        { route: 'receive', content: 'Receive', icon: 'mdi-arrow-left-bold-box' },
        { route: 'payments', content: 'Payments', icon: 'assignment' },
        { route: 'logout', content: 'Logout', icon: 'power_settings_new' },
      ],
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
    ...mapActions(['handleScan']),

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

    setMasks () {
      let body = document.body, html = document.documentElement
      let height = Math.max(
        body.scrollHeight, 
        body.offsetHeight, 
        html.clientHeight, 
        html.scrollHeight, 
        html.offsetHeight)

      document.getElementById('filler').style.height = height
      document.getElementById('rightfiller').style.height = height
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
            document.querySelector('#wrapper').style.display = 'none'
            document.querySelector('#camcontrols').style.display = 'block'
            window.QRScanner.scan((err, res) => {
              if (err) { 
                console.log(err) 
              } else {
                this.handleScan(res)
              }

              document.querySelector('#wrapper').style.display = 'block'
              document.querySelector('#camcontrols').style.display = 'none'
              window.QRScanner.hide()
            })
          })
        })
      } 
    },

    toggleMenu () {
      this.drawer = !this.drawer
    },

    authenticate (route) {
      const publicpaths = ['/login', '/about', '/register']
      if (!publicpaths.includes(route.path) && !this.user) {
        this.$router.push('/login')
      }
    },
  },

  async created () {
    this.authenticate(this.$route)
    this.setMasks()

    this.addEvent(window, 'resize', this.setMasks)
  },
}
</script> 

<style lang="stylus">
.input-group--focused label
  color black !important

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
  max-height 40px

img.fx
  width 30px
  height 30px

.fade-enter-active
  transition: opacity 0.3s

.fade-enter
  opacity: 0

.bottom-nav .btn
  width 88px
</style>
