<template lang="pug">
    v-app(dark)#app
      top-bar
      snack-bar
      div(v-if='webscanning').text-xs-center
        qrcode-stream(@decode='handleScan')
        v-btn(@click='handleScan' style='margin-bottom: 30px') Cancel
      v-content(v-show='!scanning')
        v-alert(v-if='error' color='error' v-model='error' value='error' dismissible transition='scale-transition') {{error}}
        transition(name="fade" mode="out-in" appear)
          v-container.mr-3
            router-view
      div(style='height: 60px')
      bottom-nav
</template>

<script>
import { mapActions } from 'vuex'
import BottomNav from './components/BottomNav'
import SnackBar from './components/SnackBar'
import TopBar from './components/TopBar'
import { mapGetters } from 'vuex'
import { QrcodeStream } from 'vue-qrcode-reader'

export default {
  components: { BottomNav, SnackBar, TopBar, QrcodeStream },

  computed: {
    ...mapGetters(['scanning', 'user']),

    webscanning () { return this.scanning && !window.QRScanner },
    
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

    authenticate (route) {
      const publicpaths = ['/login', '/about', '/register']
      if (!publicpaths.includes(route.path) && !this.user.address) {
        this.$router.push('/login')
      }
    },
  },

  async created () {
    await this.init()
    this.authenticate(this.$route)
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

@media only screen and (min-width: 960px)
  .container
    max-width 1000px !important
</style>
