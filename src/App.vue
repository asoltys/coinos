<template>
  <v-app id="app">
    <top-bar />
    <snack-bar />
    <v-content v-show="scanning">
      <div class="text-center" v-if="webscanning">
        <qrcode-stream class="mt-4" @decode="handleScan"></qrcode-stream>
        <v-btn @click="handleScan" class="my-2">Cancel</v-btn>
      </div>
    </v-content>
    <v-content v-show="!scanning" style="background: #333">
      <transition name="fade" mode="out-in" appear>
        <v-container class="mr-3" style="margin-bottom: 50px !important">
          <v-alert
            class="mb-2"
            v-if="error"
            color="error"
            dismissible
            transition="scale-transition"
            >{{ error }}</v-alert
          >
          <two-fa />
          <router-view :key="$route.path"></router-view>
          <div class="text-center pa-4">
            <v-btn
              v-if="
                ['/', '/settings', '/about'].includes($route.path) &&
                  promptInstall
              "
              class="wide mb-2 mr-1"
              @click="install"
            >
              <v-icon class="mr-1" color="green">stay_current_portrait</v-icon
              ><span>Add to Home Screen</span>
            </v-btn>
          </div>
        </v-container>
      </transition>
    </v-content>
    <bottom-nav v-if="user && user.address" />
  </v-app>
</template>

<script>
import { mapActions } from 'vuex';
import BottomNav from './components/BottomNav';
import SnackBar from './components/SnackBar';
import TopBar from './components/TopBar';
import { mapGetters } from 'vuex';
import { QrcodeStream } from 'vue-qrcode-reader';
import Window from './window.js';
import TwoFa from './components/TwoFa';

export default {
  components: { BottomNav, SnackBar, TopBar, TwoFa, QrcodeStream },

  data() {
    return {
      installed: false,
    };
  },

  computed: {
    ...mapGetters(['loading', 'scanning', 'user']),

    prompt() {
      return Window.prompt;
    },

    promptInstall() {
      return this.prompt && !this.installed;
    },

    webscanning() {
      return this.scanning && !window.QRScanner;
    },

    error: {
      get() {
        return this.$store.getters.error;
      },
      set(v) {
        this.$store.commit('SET_ERROR', v);
      },
    },
  },

  watch: {
    $route() {
      this.init();
    },
  },

  methods: {
    ...mapActions(['init', 'handleScan']),

    async install() {
      const { outcome } = await this.prompt.prompt();
      if (outcome === 'accepted') this.installed = true;
    },

    addEvent(object, type, callback) {
      if (object == null || typeof object == 'undefined') return;
      if (object.addEventListener) {
        object.addEventListener(type, callback, false);
      } else if (object.attachEvent) {
        object.attachEvent('on' + type, callback);
      } else {
        object['on' + type] = callback;
      }
    },
  },

  created() {
    this.init();
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

.fade-transition
  &-leave-active
    position: absolute

  &-enter-active, &-leave, &-leave-to
    transition: $primary-transition

  &-enter, &-leave-to
    opacity: 0

img.logo
  cursor pointer
  max-height 40px

img.fx
  width 30px
  height 30px

.fade-enter-active
  transition: opacity 0.3s

.fade-enter
  opacity: 0

#app
  margin auto
  box-shadow 0 0 0 9999px rgba(20, 20, 20, 1)

body
  background #222

@media only screen and (min-width: 960px)
  .container
    max-width 1000px !important

@media print
  .v-btn, header, #footer
    display none !important
  
  .v-card
    box-shadow none

  *
    color black !important

@media (max-width: 600px)
  .wide
    width 100%
    height 62px !important
</style>
