<template lang="pug">
  v-app(dark)
    v-toolbar(app dark color="primary" clipped-left fixed)
      v-toolbar-side-icon(v-if='user' @click.stop='toggleMenu')
      v-toolbar-title(dark @click='$router.push("/")')
        img.logo(src='static/img/coinos_logo.png')
      v-spacer
      v-btn(icon @click='$router.push("/about")')
        v-icon(color='yellow') mdi-flash
      v-btn(icon @click='$router.push("/logout")')
        v-icon power_settings_new
    v-navigation-drawer.primary(v-if='user' v-model='drawer' enable-resize-watcher app clipped)
      v-list.secondary
        template(v-for='i in menu') 
          v-list-tile(:key='i.route' ripple @click='$router.push(i.route)')
            v-list-tile-action
              v-btn(icon ripple)
                v-icon {{i.icon}}
            v-list-tile-content {{i.content}}
    v-content
      v-container.pl-2(fluid)
        router-view
    v-footer(app)
      v-bottom-nav(absolute style="height: 60px; margin-bottom: 55px")
        v-btn(flat dark @click="$router.push('/receive')")
          span Receive
          v-icon mdi-arrow-left-bold-box
        v-btn(flat dark @click="scan" v-if='native()')
          span Scan
          v-icon camera_alt
        v-btn(flat dark @click="$router.push('/send')")
          span Send
          v-icon mdi-send
</template>

<script>
import socketio from 'socket.io-client'
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['user']),
  }, 

  data () {
    return {
      drawer: false,
      menu: [
        { route: 'home', content: 'Deposit', icon: 'assignment_returned' },
        { route: 'send', content: 'Send', icon: 'mdi-send' },
        { route: 'receive', content: 'Receive', icon: 'mdi-arrow-left-bold-box' },
        { route: 'withdraw', content: 'Withdraw', icon: 'eject' },
        { route: 'payments', content: 'Payments', icon: 'assignment' },
        { route: 'account', content: 'Account', icon: 'person' },
        { route: 'settings', content: 'Settings', icon: 'settings' },
        { route: 'logout', content: 'Logout', icon: 'power_settings_new' }
      ]
    }
  },

  watch: {
    $route (route) {
      this.authenticate(route)
    },
  },

  methods: {
    ...mapActions(['handleScan']),

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
        window.QRScanner.prepare((err, status) => {
          if (err) {
            console.error(err)
            return
          } 

          window.QRScanner.show((status) => {
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
</style>
