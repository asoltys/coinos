<template lang="pug">
v-layout
  v-flex(xs12 md4)
    v-alert(v-if='message' color='error' value='message') {{message}}
    v-alert.black--text(color='yellow' icon='info' v-if='logout' value='logout') You've logged out 
    v-form(@submit='submit')
      v-text-field(label="Username" v-model='user.username' autofocus dark)
      v-text-field(label="Password" v-model='user.password' type='password')
      v-btn(type='submit') Sign in
      v-btn(@click='$router.push("/register")') Register
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: ['logout'],
  data () {
    return {
      user: {
        username: 'bob',
        password: 'pw'
      },
      message: ''
    }
  },
  methods: {
    ...mapActions(['login']),

    async submit (e) {
      let user = this.$data.user
      e.preventDefault()
      try {
        this.login(this.user)
      } catch (e) {
        this.message = 'Login failed'
        console.log(e)
      }
    }
  },

  created () {
    if (this.logout) {
      this.$store.commit('SET_USER', null)
    }
  },
}
</script>

<style lang="stylus" scoped>
  .logo
    background-image url('/static/img/coinos_logo.png')
</style>
