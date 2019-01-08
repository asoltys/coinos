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
        v-btn(v-if='native()' color="#4267b2" @click='facebookConnect') Facebook Login 
        v-btn(v-else color="#4267b2")
          fb-signin-button(:params="fbSignInParams" @success="onSignInSuccess" @error="onSignInError") Facebook Login
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
      fbSignInParams: {
        scope: 'email,user_friends',
        return_scopes: true,
      },
      user: {
        username: '',
        password: '',
      },
      showlogout: false,
    }
  },

  computed: mapGetters(['error']),

  methods: {
    ...mapActions(['login', 'facebookLogin']),

    download () {
      window.location = 'https://play.google.com/store/apps/details?id=io.cordova.coinos'
    },

    onSignInSuccess (res) {
      this.facebookLogin(res)
    },

    onSignInError (error) {
      console.log('Facebook login failed', error)
    },

    facebookConnect () {
      window.facebookConnectPlugin.login(this.fbSignInParams.scope.split(','), this.onSignInSuccess, this.onSignInError)
    }, 

    native () {
      return window.location.protocol === 'file:'
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

  .fb-signin-button 
    display: inline-block;
    padding: 4px 8px;
    border-radius: 3px;
</style>
