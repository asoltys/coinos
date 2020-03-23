<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <template v-else-if="generated">
      <request v-if="received < amount" v-bind="{ copytext }" @clear="clear" />
      <balance v-else />
      <received v-if="received" @clear="clear" />
      <v-btn @click="clear" class="mb-2">
        <v-icon>arrow_back</v-icon><span>Go Back</span>
      </v-btn>
    </template>
    <div v-else>
      <numpad class="mr-4 mb-2" @done="lightning" />

      <div class="d-flex flex-wrap buttons">
        <v-btn class="flex-grow-1 mb-2 mr-2" @click="bitcoin">
          <img class="mr-1" src="../assets/bitcoin.png" width="30px" />
          <span>Bitcoin</span>
        </v-btn>

        <v-btn
          class="flex-grow-1 mb-2 mr-2"
          @click="lightning"
          :disabled="amount <= 0"
        >
          <flash fillColor="yellow"></flash>
          <span>Lightning</span>
        </v-btn>

        <v-btn class="flex-grow-1 mr-0" @click="liquid">
          <water fillColor="#00aaee"></water>
          <span>Liquid</span>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import qr from 'qrcode';
import Balance from './Balance';
import Numpad from './NumPad';
import Received from './Received';
import Request from './Request';
import { mapGetters, mapActions } from 'vuex';
import Flash from 'vue-material-design-icons/Flash';
import Water from 'vue-material-design-icons/Water';

export default {
  components: { Balance, Flash, Numpad, Received, Request, Water },

  filters: {},

  data() {
    return {
      message: '',
      about: '',
      full: false,
      tip: 0,
      generated: false,
      showcode: false,
      finished: false,
      bitreq: '',
    };
  },

  computed: {
    ...mapGetters(['amount', 'loading', 'user', 'payreq', 'rate', 'received']),

    tosat() {
      return this.currency === 'sat' ? 1 : 100000000;
    },
    copytext() {
      return this.bitreq || this.payreq;
    },
  },

  methods: {
    ...mapActions(['addInvoice', 'snack', 'clearPayment', 'shiftCurrency']),

    portrait() {
      return window.innerHeight > window.innerWidth;
    },

    bitcoin() {
      this.$store.commit('loading', true);
      this.$store.commit('received', 0);

      this.generated = true;

      this.$nextTick(async () => {
        this.$store.commit('loading', false);
        this.$nextTick(() => {
          let canvas = document.getElementById('qr');
          let { address } = this.user;
          if (!canvas) return;

          this.bitreq =
            this.amount > 0
              ? `bitcoin:${address}?amount=${this.amount / 100000000}`
              : address;
          qr.toCanvas(canvas, this.bitreq, e => {
            if (e) console.log(e);
          });

          canvas.style.width = '35vh';
          canvas.style.height = '35vh';
        });
      });
    },

    liquid() {
      let { confidential: address } = this.user;

      this.$store.commit('loading', true);
      this.$store.commit('received', 0);

      this.generated = true;

      this.$nextTick(async () => {
        this.$store.commit('loading', false);
        this.$nextTick(() => {
          let canvas = document.getElementById('qr');
          if (!canvas) return;

          this.bitreq =
            this.amount > 0
              ? `liquid:${address}?amount=${this.amount / 100000000}`
              : address;
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
          await this.addInvoice({ amount: this.amount, tip: this.tip });
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

    clear() {
      this.generated = false;
      this.$store.commit('error', '');
      this.$store.commit('received', 0);
    },

    checkRefresh() {
      if (this.$route.query.refresh !== undefined) {
        this.$router.replace(this.$route.path);
      } else {
        this.clear();
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

@media (max-width: 600px)
  .buttons .v-btn
    width 100%
    height 62px !important
</style>
