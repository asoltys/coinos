<template>
  <v-bottom-navigation
    class="d-flex justify-space-around"
    height="60"
    background-color="#212121"
    dark
  >
    <v-btn class="flex-grow-1" text @click="$router.push('/home')">
      <span>Home</span>
      <v-icon>home</v-icon>
    </v-btn>
    <v-btn class="flex-grow-1" text @click="$router.push('/payments')">
      <span>Payments</span>
      <v-icon>assignment </v-icon>
    </v-btn>
    <v-btn class="flex-grow-1" text @click="scan">
      <span>Scan</span>
      <v-icon>camera_alt</v-icon>
    </v-btn>
    <v-btn class="flex-grow-1" text @click="$router.push('/receive?refresh')">
      <span>Receive</span>
      <arrow-left />
    </v-btn>
    <v-btn
      class="flex-grow-1"
      v-if="user && !user.readonly"
      text
      @click="$router.push('/send?refresh')"
    >
      <span>Send</span>
      <send></send>
    </v-btn>
  </v-bottom-navigation>
</template>

<script>
import Send from 'vue-material-design-icons/Send';
import ArrowLeft from 'vue-material-design-icons/ArrowLeftBold';
import { mapActions, mapGetters } from 'vuex';

export default {
  components: { ArrowLeft, Send },

  computed: mapGetters(['user']),

  methods: {
    native() {
      return typeof window.cordova !== 'undefined';
    },

    ...mapActions(['scan']),
  },
};
</script>

<style lang="stylus">
.v-bottom-navigation .v-btn
  height 60px !important
</style>
