<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <template v-else-if="generated">
      <Received
        v-if="received"
        v-bind="{ currency: user.currency, rate, received }"
        @clear="clear"
      />
      <Request v-else v-bind="{ copytext, total }" @clear="clear" />
    </template>
    <div v-else>
      <div class="d-flex">
        <numpad
          class="col-8"
          :currency="currency"
          :amount="parseFloat(amount)"
          @update="a => (amount = a)"
          @toggle="toggle"
        />
        <tippad
          class="col-4"
          :amount="parseFloat(amount)"
          @update="t => (tip = t)"
        />
      </div>

      <v-btn class="mr-2" @click="bitcoin" :disabled="total <= 0">
        <img class="mr-1" src="../assets/bitcoin.png" width="30px" />
        <span>Bitcoin</span>
      </v-btn>

      <v-btn class="mr-0" @click="lightning" :disabled="total <= 0">
        <flash fillColor="yellow"></flash>
        <span>Lightning</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import qr from 'qrcode';
import Numpad from './NumPad';
import Received from './Received';
import Request from './Request';
import Tippad from './TipPad';
import { mapGetters, mapActions } from 'vuex';
import Flash from 'vue-material-design-icons/Flash';

const f = parseFloat;

export default {
  components: { Flash, Numpad, Received, Request, Tippad },

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

.v-btn.subheading
  width 100%

.total
  vertical-
</style>
