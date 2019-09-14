<template>
  <div class="text-center">
    <v-flex class="mb-2" v-if="!isNaN(animatedBalance)">
      <span class="display-2 font-weight-black">{{ animatedBalance }} </span>
      <span class="headline">SAT</span>
      <h3>
        {{ ((animatedBalance / 100000000) * animatedRate).toFixed(2) }} CAD @
        <span class="font-weight-black yellow--text">{{ animatedRate }}</span>
        per BTC
      </h3>
      <div class="yellow--text text--lighten-3" v-if="user.pending">
        <span class="display-2">{{ animatedPending }} </span>
        <span class="headline">pending</span>
        <h3>
          {{ ((animatedPending / 100000000) * animatedRate).toFixed(2) }} CAD
        </h3>
      </div>
    </v-flex>
    <v-flex xs12>
      <v-card>
        <v-container class="request">
          <v-layout wrap>
            <v-flex class="text-center" id="canvas-container" xs12>
              <canvas id="qr" @click="fullscreen"></canvas>
            </v-flex>
            <v-flex class="text-center" xs12>
              <div>
                <code class="black--text mt-2">{{ user.address }}</code>
              </div>
              <v-btn @click="copy" class="mt-2">
                <v-icon class="mr-1">content_copy</v-icon><span>Copy</span>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <div class="mx-auto">
      <v-btn
        class="mr-2"
        v-if="user.fbtoken"
        @click="$router.push('/contacts')"
      >
        <v-icon class="mr-1">person</v-icon><span>Address Book</span>
      </v-btn>
      <v-btn v-if="user.limit > 0" @click="$router.push('/buy')">
        <v-icon class="mr-1">credit_card</v-icon><span>Add Funds</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import qr from 'qrcode';
import { mapGetters, mapActions } from 'vuex';
import { TweenLite } from 'gsap';

export default {
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
      tweenedBalance: null,
      tweenedPending: null,
      tweenedRate: null,
      full: false,
      playing: false,
      received: 0,
      funding_amt: 0,
    };
  },

  computed: {
    ...mapGetters(['fbtoken', 'rate', 'user', 'verified']),
    animatedBalance() {
      return parseInt(this.tweenedBalance).toFixed(0);
    },
    animatedPending() {
      return parseInt(this.tweenedPending).toFixed(0);
    },
    animatedRate() {
      return parseFloat(this.tweenedRate).toFixed(2);
    },
  },

  watch: {
    rate(rate) {
      let tweenedRate = rate;
      TweenLite.to(this.$data, 0.5, { tweenedRate });
    },

    user: {
      handler(user) {
        let tweenedBalance = user.balance;
        let tweenedPending = user.pending;

        if (user.pending === 0) user.pending = null;

        TweenLite.to(this, 0.5, { tweenedBalance });
        TweenLite.to(this, 0.5, { tweenedPending });

        if (!this.tweenedBalance) this.tweenedBalance = 0;

        this.drawQR();
      },
      deep: true,
    },
  },

  methods: {
    ...mapActions(['snack']),

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

    this.tweenedBalance = this.user.balance;
    this.tweenedPending = this.user.pending;
    this.tweenedRate = this.rate;
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

.request
  padding 8 0
</style>
