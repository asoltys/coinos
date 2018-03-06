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
    v-content
      v-container.pl-3
        v-navigation-drawer(color='black' v-if='user' v-model='drawer' enable-resize-watcher app clipped absolute hide-overlay mobile-break-point='10000')
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
    v-footer(app absolute)
      v-bottom-nav(v-if='user' absolute style="height: 60px; margin-bottom: 55px")
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
      v-layout(v-else style="margin-bottom: 100px")
        v-flex.text-xs-center(v-if='!native()')
          v-btn(@click='download')
            v-icon.mr-1(color='green') dashboard
            span Download Android App
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
  }, 

  watch: {
    $route (route) {
      this.$store.commit('SET_ERROR', '')
      this.authenticate(route)
    },
  },

  methods: {
    ...mapActions(['handleScan']),

    download () {
      window.location = '/static/coinos.apk'
    },

    scantest () {
      // this.handleScan('lntb15920n1pdfv5mqpp5ygalsdx3g0q24t8sgqv3lwcw8a64c4cejrnqftluljcg5v7x03qsdqqcqzysjgtcyyg03ukffsk29u77a2pgp9jw2f5xsj3q2wnteph62jwk5gj9gs6k8qc467s3d5h58d6gshhk9g7v8axyl4hg6eucv3vk7v2zxpcq8e4222')
      // this.handleScan('3QzfswBjpeaRCpq98ui2ZUPQg3XfnPrMZJ')
      this.handleScan('bitcoin:1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH?amount=20.3&label=Foobar')
    },

    native () {
      return typeof cordova !== 'undefined'
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
</style>
