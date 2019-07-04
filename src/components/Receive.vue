<template lang="pug">
  div
    v-progress-linear(v-if='loading' indeterminate)
    template(v-else-if='generated')
      template(v-if='received')
        v-card
          v-alert.headline(value='true' color='success') Payment Received!
          v-list
            v-list-tile
              v-list-tile-title Satoshis
              v-list-tile-sub-title {{received}}
            v-list-tile
              v-list-tile-title CAD
              v-list-tile-sub-title {{(received / 100000000 * rate).toFixed(2)}}
          v-card-actions
            v-btn(@click='clear') 
              v-icon arrow_back
              span Go Back
      v-layout(v-else)
        v-flex(xs12)
          h2.text-xs-center Send {{total}} Satoshis
          v-card.pa-3.text-xs-center
            div.code(v-if='showcode') {{copytext}}
            canvas#qr(v-show='!showcode' width='100' height='100' @click='fullscreen')
            v-btn(@click.native="showcode = !showcode")
              v-icon code
              span {{code}}
            v-btn(@click.native="copy")
              v-icon content_copy
              span Copy
          v-btn(@click='clear') 
            v-icon arrow_back
            span Go Back
    template(v-else)
      v-layout(row wrap)
        v-flex(v-if='portrait()' xs12)
          v-layout
            v-flex(xs9)
              numpad(:currency='currency' :amount='parseFloat(amount)' @update='a => amount = a' @toggle='toggle')
            v-flex(xs3)
              tippad(:amount='parseFloat(amount)' @update='t => tip = t')
        v-flex(v-else xs12 sm8)
          v-layout
            v-flex(xs9)
              numpad(:currency='currency' :amount='parseFloat(amount)' @update='a => amount = a' @toggle='toggle')
            v-flex(xs3)
              tippad(:amount='parseFloat(amount)' @update='t => tip = t')
        v-flex(v-if='portrait()' xs12)
          v-layout(row wrap)
            v-flex.text-xs-center.mt-4
              v-btn(@click='bitcoin' :disabled='total <= 0') 
                img(src='../assets/bitcoin.png' width='30px').mr-1
                span Bitcoin
              v-btn(@click='lightning' :disabled='total <= 0') 
                flash(fillColor='yellow')
                span Lightning
        v-flex(v-else xs12 sm4)
          v-layout(column justify-center)
            v-flex.text-sm-right
              v-btn(@click='bitcoin' :disabled='total <= 0').mr-0
                img(src='../assets/bitcoin.png' width='30px').mr-1
                span Bitcoin
            v-flex.text-sm-right
              v-btn(@click='lightning' :disabled='total <= 0').mr-0
                flash(fillColor='yellow')
                span Lightning
</template>

<script>
import qr from 'qrcode';
import Numpad from './NumPad';
import Tippad from './TipPad';
import { mapGetters, mapActions } from 'vuex';
import Flash from 'vue-material-design-icons/Flash';

const f = parseFloat;

export default {
  components: { Flash, Numpad, Tippad },

  filters: {},

  data() {
    return {
      message: '',
      about: '',
      amount: 0,
      full: false,
      tip: 0,
      generated: false,
      showcode: false,
      finished: false,
      fiat: true,
      bitreq: '',
    };
  },

  computed: {
    ...mapGetters(['loading', 'user', 'payreq', 'rate', 'received']),

    tosat() {
      return this.currency === 'sat' ? 1 : 100000000;
    },
    copytext() {
      return this.bitreq || this.payreq;
    },
    code() {
      return this.showcode ? 'Show QR' : 'Show Code';
    },
    total() {
      let total = f(this.amount) + f(this.tip);
      if (this.fiat) total /= this.rate;
      return (total * this.tosat).toFixed(0);
    },

    currency() {
      if (this.fiat) return this.user.currency;
      return 'sat';
    },

    conversion() {
      if (this.fiat) return this.rate;
      return parseFloat(1 / this.rate).toFixed(6);
    },
  },

  methods: {
    ...mapActions(['addInvoice', 'snack', 'clearPayment']),

    portrait() {
      return window.innerHeight > window.innerWidth;
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

    copy() {
      var textArea = document.createElement('textarea');
      textArea.style.position = 'fixed';
      textArea.value = this.copytext;

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      document.execCommand('copy');
      document.body.removeChild(textArea);

      this.snack('Copied to Clipboard');
    },

    toggle() {
      this.fiat = !this.fiat;
      if (this.fiat) this.amount = (this.amount / 100000000) * this.rate;
      else this.amount = (this.amount * 100000000) / this.rate;
    },

    timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    bitcoin() {
      let { address } = this.user;
      let { tip, total } = this;
      let amount = total;

      this.$store.commit('loading', true);
      this.$store.commit('received', 0);

      this.generated = true;

      this.$nextTick(async () => {
        await this.addInvoice({ amount, tip, address });

        this.$store.commit('loading', false);
        this.$nextTick(() => {
          let canvas = document.getElementById('qr');
          if (!canvas) return;

          this.bitreq = `bitcoin:${this.user.address}?amount=${this.total /
            100000000}`;
          qr.toCanvas(canvas, this.bitreq, e => {
            if (e) console.log(e);
          });

          canvas.style.width = '35vh';
          canvas.style.height = '35vh';
        });
      });
    },

    lightning() {
      this.bitreq = null;
      this.$store.commit('loading', true);
      this.generated = true;
      this.$store.commit('received', 0);
      this.$nextTick(async () => {
        try {
          await this.addInvoice({ amount: this.total, tip: this.tip });
          this.$store.commit('loading', false);
          this.$nextTick(() => {
            let canvas = document.getElementById('qr');
            if (!canvas) return;
            qr.toCanvas(canvas, this.payreq, e => {
              if (e) console.log(e);
            });
            canvas.style.width = '35vh';
            canvas.style.height = '35vh';
          });
        } catch (e) {
          console.log(e);
        }
      });
    },

    finish() {
      this.finished = true;
    },

    async clear() {
      this.generated = false;
      this.$store.commit('loading', true);
      this.$store.commit('received', 0);
      await this.timeout(50);
      this.$nextTick(() => this.$store.commit('loading', false));
    },

    checkRefresh() {
      if (this.$route.query.refresh !== undefined) {
        this.$router.replace(this.$route.path);
      } else {
        this.clear();
        this.amount = 0;
        this.generated = false;
      }
    },
  },

  beforeRouteUpdate(to, from, next) {
    next();
    this.checkRefresh();
  },

  mounted() {
    this.clear();
    this.checkRefresh();
  },
};
</script>

<style lang="stylus" scoped>
canvas
  position relative
  display block
  height 100%
  margin-left auto
  margin-right auto

.code
  margin auto
  width 260px
  height 260px
  background #333
  word-wrap break-word
  padding 15px

.v-btn.subheading
  width 100%

.total
  vertical-
</style>
