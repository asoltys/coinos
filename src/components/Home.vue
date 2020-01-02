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
      <v-btn v-if="promptInstall" class="ad2hs-prompt mb-2 mr-1" @click="a2hs">
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
      playing: false,
      received: 0,
      funding_amt: 0,
    };
  },

  computed: {
    ...mapGetters(['fbtoken', 'rate', 'user', 'verified']),
    promptInstall() {
      return typeof window.deferredPrompt != 'undefined';
    },
  },

  methods: {
    ...mapActions(['snack']),

    a2hs() {
      window.deferredPrompt.prompt(); // Wait for the user to respond to the prompt
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
      let canvas = document.getElementById('qr');

      if (this.full) {
        canvas.style.position = 'relative';
        canvas.style.width = '25vh';
        canvas.style.height = '25vh';
        canvas.style.left = 0;
        document.querySelector('#canvas-container').appendChild(canvas);
        this.full = false;
        return;
      }

      canvas.style.position = 'absolute';
      canvas.style.top = 0;
      canvas.style.left =
        window.innerWidth / 2 -
        Math.min(window.innerWidth, window.innerHeight) / 2 +
        'px';
      canvas.style.width = canvas.style.height =
        Math.min(window.innerWidth, window.innerHeight) + 'px';
      canvas.style.zIndex = 9999;
      document.querySelector('body').appendChild(canvas);
      this.full = true;
    },

    max() {
      this.funding_amt = this.user.balance;
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
    this.max();
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
