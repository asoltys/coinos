<template lang="pug">
  v-app(dark)
    v-toolbar(absolute app dark color="black" clipped-left fixed)
      v-toolbar-side-icon(v-if='user' @click.stop='toggleMenu')
      v-toolbar-title(dark @click='$router.push("/")')
        img.logo(src='static/img/coinos_logo.png')
      v-spacer
      v-btn(icon @click='$router.push("/about")')
        v-icon(color='yellow') mdi-flash
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
        v-btn(flat dark @click="$router.push('/receive')")
          span Receive
          v-icon mdi-arrow-left-bold-box
        v-btn(flat dark @click="scan" v-if='native()')
          span Scan
          v-icon camera_alt
        v-btn(flat dark @click="$router.push('/home')")
          span Home
          v-icon home
        v-btn(flat dark @click="$router.push('/send')")
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
      document.getElementById('filler').style.height = window.innerHeight
      document.getElementById('rightfiller').style.height = window.innerHeight
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
            document.querySelector('.application').style.display = 'none'
            document.querySelector('#camcontrols').style.display = 'block'
            window.QRScanner.scan((err, res) => {
              if (err) { 
                console.log(err) 
              } else {
                this.handleScan(res)
              }

              document.querySelector('.application').style.display = 'block'
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

    this.addEvent(window, 'load', function () {
      this.setMasks()

      if (typeof window.cordova !== 'undefined') {
        document.getElementById('cancel').addEventListener('click', () => {
          window.QRScanner.cancelScan(status => { console.log(status) })
        })
      }
    })

    this.addEvent(window, 'resize', this.setMasks)
  },
}
</script> 

<style lang="stylus">
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
