<template>
  <div class="text-center">
    <balance />
    <v-card class="pa-4 mb-2">
      <canvas id="qr" @click="fullscreen"></canvas>
      <div>
        <code class="black--text mt-2">{{ user.address }}</code>
      </div>
      <v-btn @click="copy" class="mt-2">
        <v-icon class="mr-1">content_copy</v-icon><span>Copy</span>
      </v-btn>
    </v-card>
    <div class="mx-auto">
      <v-btn v-if="promptInstall" class="mb-2 mr-1" @click="install">
        <v-icon class="mr-1">get_app</v-icon><span>Install</span>
      </v-btn>
      <v-btn
        v-if="user.fbtoken"
        class="mr-2 mb-2"
        @click="$router.push('/contacts')"
      >
        <v-icon class="mr-1">person</v-icon><span>Address Book</span>
      </v-btn>
      <v-btn v-if="user.limit > 0" class="mb-2" @click="$router.push('/buy')">
        <v-icon class="mr-1">credit_card</v-icon><span>Add Funds</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import qr from 'qrcode';
import { mapGetters, mapActions } from 'vuex';
import Balance from './Balance';
import Window from '../window.js';

export default {
  components: { Balance },
  props: {
    username: {
      type: String,
      default: '',
    },
    email: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      full: false,
      installed: false,
    };
  },

  computed: {
    ...mapGetters(['fbtoken', 'rate', 'user', 'verified']),
    prompt() {
      return Window.prompt;
    },
    promptInstall() {
      return this.prompt && !this.installed;
    },
  },

  methods: {
    ...mapActions(['snack']),

    async install() {
      const { outcome } = await this.prompt.prompt();
      if (outcome === 'accepted') this.installed = true;
    },

    copy() {
      var textArea = document.createElement('textarea');
      textArea.style.position = 'fixed';
      textArea.value = this.user.address;

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      document.execCommand('copy');
      document.body.removeChild(textArea);

      this.snack('Copied to Clipboard');
    },

    drawQR() {
      if (!this.user.address) return;
      let canvas = document.querySelector('#qr');
      qr.toCanvas(canvas, this.user.address, e => {
        if (e) console.log(e);
      });
      canvas.style.width = '25vh';
      canvas.style.height = '25vh';
      canvas.style.cursor = 'pointer';
    },

    fullscreen() {
      if (this.full) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        this.full = false;
        return;
      }

      let elem = document.getElementById('qr');

      if (elem.requestFullscreen) {
        elem.requestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }

      this.full = true;
    },
  },

  watch: {
    user: {
      handler() {
        this.drawQR();
      },
      deep: true,
    },
  },

  mounted() {
    this.drawQR();
  },

  created() {
    if (this.email) {
      this.$store.dispatch('verifyEmail', {
        username: this.username,
        token: this.token,
      });
    }

    if (this.phone) {
      this.$store.dispatch('verifyPhone', {
        username: this.username,
        token: this.token,
      });
    }
  },
};
</script>

<style lang="stylus" scoped>
code
  max-width 100%
  word-wrap break-word
  font-size 0.9em

.v-chip
  padding 5px
  width 100%
  margin 0

.container.no-padding
  padding 0 !important

.arrows .v-btn
  margin 0
  margin-top 8px
  width 100%

.arrow
  margin 8px 0
</style>
