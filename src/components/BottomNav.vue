<template lang="pug">
v-footer.mt-auto
  v-bottom-nav(v-if='user' height='70px').bottom-nav
    v-btn(flat dark @click="$router.push('/home')")
      span Home
      v-icon home
    v-btn(flat dark @click="$router.push('/payments')")
      span Payments
      v-icon assignment 
    v-btn(flat dark @click="scan")
      span Scan
      v-icon camera_alt
    v-btn(flat dark @click="$router.push('/receive/' + Math.floor(Math.random() * 10000))")
      span Receive
      v-icon 360
    v-btn(flat dark @click="$router.push('/send')")
      span Send
      send
</template>

<script>
import Send from 'vue-material-design-icons/Send'
import ArrowLeft from 'vue-material-design-icons/ArrowLeftBold'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: { ArrowLeft, Send },

  computed: mapGetters(['user']),

  methods: {
    native () {
      return typeof window.cordova !== 'undefined'
    },

    ...mapActions(['scan']),
  },
} 
</script>

<style lang="stylus" scoped>
  .bottom-nav
    position relative 
    top -76px 

    .v-btn
      min-width 60px
</style>
