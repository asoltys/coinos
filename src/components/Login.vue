<template lang="pug">
v-layout
  v-flex(xs12)
    v-alert.black--text(color='yellow' icon='info' v-model='showlogout' value='showlogout' dismissible transition='scale-transition') You've logged out 
    v-form(@submit='submit')
      v-text-field(label="Username" v-model='user.username' autofocus dark)
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

    submit (e) {
      e.preventDefault()
      this.login(this.user)
      this.showlogout = false
    },
  },

  created () {
    if (this.logout) {
      this.$store.commit('SET_USER', null)
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
