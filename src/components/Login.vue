<template lang="pug">
div
  v-layout
    v-flex(xs12)
      v-alert.black--text(color='white' icon='info' v-model='showlogout' value='showlogout' dismissible transition='scale-transition') You've logged out 
      v-form(@submit='submit')
        v-text-field(label="Username" v-model='user.username' autofocus)
        v-text-field(label="Password" v-model='user.password' type='password')
        v-btn(type='submit') Sign in
        v-btn(@click='$router.push("/register")') Register
  div.text-xs-center.mt-5(v-if='!native()')
    v-btn(@click='download')
      v-icon.mr-1(color='green') android
      span Android App
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  props: {
    logout: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      user: {
        username: '',
        password: '',
      },
      showlogout: false,
    }
  },

  computed: mapGetters(['error']),

  methods: {
    ...mapActions(['login']),

    download () {
      window.location = 'https://play.google.com/store/apps/details?id=io.cordova.coinos'
    },

    native () {
      return typeof window.cordova !== 'undefined'
    },

    submit (e) {
      e.preventDefault()
      this.login(this.user)
      this.showlogout = false
    },
  },

  created () {
    if (this.logout) {
      this.$store.dispatch('logout')
    }
  },

  mounted () {
    this.showlogout = this.logout
  },
}
</script>

<style lang="stylus" scoped>
  .logo
    background-image url('/static/img/coinos_logo.png')
</style>
