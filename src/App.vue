<template>
  <v-app id="app">
    <top-bar />
    <snack-bar />
    <v-content v-show="scanning">
      <div class="text-center" v-if="webscanning">
        <qrcode-stream class="mt-4" @decode="handleScan"></qrcode-stream>
        <v-btn @click="handleScan" class="mr-2 my-2">
          <v-icon class="mr-1" color="red">cancel</v-icon>
          Cancel
        </v-btn>
      </div>
    </v-content>
    <v-content v-show="!scanning" style="background: #333">
      <transition
        name="fade"
        mode="in"
      >
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

          <transition name="fade">
            <router-view v-if="!initializing" :key="$route.path" />
          </transition>

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
import Window from './window';
import TwoFa from './components/TwoFa';
import paths from './paths';

export default {
  components: { BottomNav, SnackBar, TopBar, TwoFa, QrcodeStream },

  data() {
    return {
      installed: false,
    };
  },

  computed: {
    ...mapGetters(['initializing', 'loading', 'scanning', 'user']),

    publicPath() {
      return paths.includes(this.$route.path);
    },

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
    ...mapActions(['init', 'handleScan', 'showText']),

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

.truncate
  overflow hidden
  text-overflow ellipsis
  white-space nowrap

@media (max-width: 600px)
  .truncate
    max-width 100px

  .wide
    width 100%
    height 62px !important

@media (min-width: 960px)
  .container
    max-width 1000px !important

@media print
  .v-btn, header, #footer
    display none !important

  .v-card
    box-shadow none

  *
    color black !important
</style>
