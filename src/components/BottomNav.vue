<template>
  <div id="footer" v-if="!fullscreen">
    <v-bottom-navigation
      class="d-flex justify-space-around text-center"
      height="60"
      background-color="#212121"
      dark
    >
      <v-btn class="flex-grow-1" text @click="$go('/wallets')">
        <span>Wallets</span>
        <v-icon>$wallet</v-icon>
      </v-btn>
      <v-btn class="flex-grow-1" text @click="$go('/receive?refresh')">
        <span>Receive</span>
        <v-icon>$download</v-icon>
      </v-btn>
      <v-btn class="flex-grow-1" text @click="$go('/scan')">
        <span>Scan</span>
        <v-icon>$camera</v-icon>
      </v-btn>
      <v-btn class="flex-grow-1" v-if="user" text @click="$go('/send?refresh')">
        <span>Send</span>
        <v-icon>$send</v-icon>
      </v-btn>
      <v-btn class="flex-grow-1" text @click="$go('/exchange')">
        <span>Exchange</span>
        <v-icon>$swap</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import goTo from 'vuetify/es5/services/goto';

export default {
  computed: {
    fullscreen: get('fullscreen'),
    user: get('user'),
  },

  methods: {
    home() {
      this.$go('/home');
      goTo(0);
    },
  },
};
</script>

<style lang="stylus">
#footer {
 position: fixed; bottom: 0; padding: 0; width: 100%; z-index: 1;
}

.v-bottom-navigation .v-btn
  height 60px !important
</style>
