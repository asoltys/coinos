<template>
  <v-app id="app">
    <top-bar />
    <snack-bar type="success" :text="success" :timeout="2500" @done="success = null" />
    <snack-bar type="info" :text="snack" :timeout="2500" @done="snack = null" />
    <snack-bar type="error" :text="error" @done="error = null" />
    <v-main>
      <v-container>
        <v-alert
          class="mb-2 black--text"
          v-if="versionMismatch"
          color="primary"
          dismissible
          transition="scale-transition"
        >
          <div class="d-flex">
            <div
              class="my-auto flex-grow-1"
              @click="showVersion = !showVersion"
              style="cursor: pointer"
            >
              <v-icon color="black">$info</v-icon>
              coinos update detected
            </div>
            <v-btn @click="refresh">
              <v-icon left>$refresh</v-icon>
              Reload</v-btn
            >
          </div>
          <v-card class="mt-2" v-if="showVersion">
            <v-card-text class="white--text">
              {{ versionMismatch }}
            </v-card-text>
          </v-card>
        </v-alert>
        <two-fa />
        <password />
        <pin />
        <router-view v-if="!initializing" :key="$route.path" />
        <v-progress-linear v-else indeterminate />
      </v-container>
    </v-main>
    <bottom-nav v-if="user && user.id" />
  </v-app>
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
import BottomNav from './components/BottomNav';
import SnackBar from './components/SnackBar';
import TopBar from './components/TopBar';
import Password from './components/Password';
import Pin from './components/Pin';
import TwoFa from './components/TwoFa';

export default {
  components: { BottomNav, SnackBar, TopBar, Password, TwoFa, Pin },

  data() {
    return {
      index: 0,
      showVersion: false,
    };
  },

  computed: {
    snack: sync('snack'),
    seed: get('seed'),
    initializing: get('initializing'),
    socket: get('socket'),
    user: sync('user'),
    versionMismatch: get('versionMismatch'),

    webscanning() {
      return this.scanning && !window.QRScanner;
    },

    success: sync('success'),
    error: sync('error'),
  },

  methods: {
    getAssets: call('getAssets'),
    refresh() {
      window.location.reload(true);
    },
    updateUser: call('updateUser'),
    init: call('init'),
    handleScan: call('handleScan'),
    showText: call('showText'),
    setupNfc: call('setupNfc'),
  },

  watch: {
    $route() {
      this.init();
    },
  },

  mounted() {
    this.getAssets();
    this.setupNfc();
  },
};
</script>

<style lang="stylus">
  @media all and (orientation:portrait), (min-width: 800px)
    .portrait
      display block
    .landscape
      display none
    #app, #footer
      max-width 768px

  @media all and (orientation:landscape) and (max-width: 1024px)
    .portrait
      display none
    .landscape
      display block
    #app, #footer
      max-width 1024px

.input-group--focused label
  color white !important

.toolbar__title
  cursor pointer

img.logo
  cursor pointer
  max-height 40px

img.fx
  width 30px
  height 30px

#app
  margin auto
  box-shadow 0 0 0 9999px rgba(20, 20, 20, 1)

body
  background #222

.truncate
  overflow hidden
  text-overflow ellipsis
  white-space nowrap

@media (max-width: 599px)
  .truncate
    max-width 100px

  .wide
    width 100%
    height 62px !important

@media (min-width: 960px)
  .container
    max-width 1000px !important

@media screen
  .print
    display none

@media print
  .no-print
    display none

  .v-btn, header, #footer, .snack
    display none !important

  .v-card
    box-shadow none

  *
    color black !important

.grecaptcha-badge
  display none

.v-application code
  background white
  padding 5px

.readonly.theme--dark.v-input input, .readonly.theme--dark.v-input textarea
  color #ccc;

.toggle
  margin auto 0.25rem !important
  margin-top -0.3rem !important
  height 1.7rem !important
</style>
