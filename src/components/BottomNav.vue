<template>
  <v-footer v-if="user && user.username" fixed height="60px">
    <v-bottom-navigation height="60px" absolute>
      <v-btn flat dark @click="$router.push('/home')"
        ><span>Home</span>
        <v-icon>home</v-icon>
      </v-btn>
      <v-btn flat dark @click="$router.push('/payments')"
        ><span>Payments</span>
        <v-icon>assignment </v-icon>
      </v-btn>
      <v-btn flat dark @click="scan"
        ><span>Scan</span>
        <v-icon>camera_alt</v-icon>
      </v-btn>
      <v-btn flat dark @click="$router.push('/receive?refresh')"
        ><span>Receive</span>
        <arrow-left></arrow-left>
      </v-btn>
      <v-btn
        v-if="!user.readonly"
        flat
        dark
        @click="$router.push('/send?refresh')"
        ><span>Send</span>
        <send></send>
      </v-btn>
    </v-bottom-navigation>
  </v-footer>
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

<style lang="stylus" scoped>
.v-footer
  max-width 768px !important
  left: 50%;
  transform: translateX(-50%);

@media all and (orientation:landscape) and (max-width: 1024px)
  .v-footer
    max-width 1024px !important

.v-item-group.v-bottom-nav
  top -60px !important
  bottom auto !important

  .v-btn
    min-width 60px
    height 60px !important
</style>
