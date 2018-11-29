<template lang="pug">
v-container
  v-layout
    v-flex
      v-alert.black--text.mb-4(color='yellow' icon='info' v-model='showlogout' value='showlogout' dismissible transition='scale-transition') You've logged out 
      v-form(@submit='submit')
        v-text-field(label="Username" v-model='user.username' autofocus dark autocapitalize='none')
        v-text-field(label="Password" v-model='user.password' type='password')
        v-btn(type='submit') Sign in
        v-btn(@click='$router.push("/register")') Register
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
  .v-text-field
    font-size 18px
</style>
