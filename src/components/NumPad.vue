<template>
  <div @keyup.prevent="keyup">
    <div class="d-flex">
      <input
        class="display-1"
        v-model="inputAmount"
        @focus="e => e.target.select()"
        @keyup.enter="done"
      />
      <v-btn
        class="toggle black--text"
        :color="color"
        @click.prevent="toggle"
        >{{ currency }}</v-btn
      >
    </div>
    <div class="d-flex" v-for="i in buttons.length / 3" :key="i">
      <v-btn
        :class="`numpad-button flex-grow-1 ${j < 3 && 'mr-1'} mb-1`"
        v-for="j in 3"
        :key="j"
        @click="update(buttons[j + 3 * i - 4])"
        :ref="id(buttons[j + 3 * i - 4])"
      >
        <template v-if="buttons[j + 3 * i - 4] !== '<'">{{
          buttons[j + 3 * i - 4]
        }}</template>
        <v-icon v-else>undo</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
const f = parseFloat;
const SATS = 100000000;

export default {
  props: {
    initialAmount: { type: Number },
    initialRate: { type: Number },
    currencies: { type: Array },
  },
  filters: {
    format(n, d) {
      return f(n).toLocaleString('en-US', {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      });
    },
  },

  data() {
    return {
      amount: this.initialAmount,
      fiatAmount: ((this.initialAmount / SATS) * this.initialRate).toFixed(2),
      inputAmount: '_',
      buttons: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '<', '0', 'C'],
      codes: Array.from(Array(10), (_, x) => x + 48),
      currency: '',
      rates: [],
    };
  },

  mounted() {
    this.rates = this.globalRates;
    this.currency = this.currencies.includes(this.user.currency)
      ? this.user.currency
      : this.user.account.ticker;
    this.inputAmount =
      this.fiat && this.fiatAmount
        ? this.fiatAmount
        : this.initialAmount || '_';
  },

  computed: {
    color() {
      let tickers = this.user.accounts.map(a => a.ticker);
      return ['SAT', 'BTC', ...tickers].includes(this.currency)
        ? 'white'
        : 'yellow';
    },
    fiat() {
      return this.user.account.ticker === 'BTC' && this.currency !== 'SAT';
    },
    decimals() {
      if (this.user.account.ticker !== 'BTC')
        return this.user.account.precision;

      switch (this.currency) {
        case 'SAT':
          return 0;
          break;
        case 'BTC':
          return 8;
          break;
        default:
          return 2;
      }
    },
    divisor() {
      return 10 ** this.decimals;
    },
    globalRate: get('rate'),
    rate() {
      switch (this.currency) {
        case 'SAT':
          return SATS;
          break;
        case 'BTC':
          return 1;
          break;
        default:
          return this.rates[this.currency];
          break;
      }
    },
    globalRates: get('rates'),
    user: get('user'),
  },

  watch: {
    inputAmount(v) {
      this.convert(v);
      this.$nextTick(() => {  if (!this.amount) this.inputAmount = '_' });
      this.$emit('input', this.amount, this.fiatAmount, this.currency);
    },
  },

  methods: {
    convert(n) {
      if (this.fiat) {
        this.fiatAmount = f(this.inputAmount).toFixed(this.decimals);
        this.amount = parseInt(
          ((parseFloat(this.fiatAmount) * SATS) / this.rate).toFixed(8)
        );
      } else {
        if (this.currency === 'SAT') {
          this.amount = parseInt(n);
          this.fiatAmount = f((n * this.globalRate) / SATS).toFixed(2);
        } else {
          this.amount = parseInt(
            parseFloat(n).toFixed(this.user.account.precision) * this.divisor
          );
        }
      }
    },
    done(e) {
      let amount = e.target.value;
      if (this.fiat)
        this.amount = parseInt(((amount * SATS) / this.rate).toFixed(8));
      else this.amount = parseInt(amount);
      this.$emit('done');
    },

    id(n) {
      let prefix = 'button-';
      if (n === '<') return prefix + 'lt';
      return prefix + n;
    },

    keyup(e) {
      if (e.target.nodeName === 'INPUT') return;
      let key = e.keyCode;
      if (key > 57) key -= 48;
      let n = this.codes.indexOf(key).toString();
      if (key === 8) n = '<';
      if (key === 46) n = 'C';
      if (n < 0) return;
      this.update(n);
    },

    async toggle() {
      if (this.currencies.length <= 1) return;
      let index = this.currencies.findIndex(c => c === this.currency);
      index = index >= this.currencies.length - 1 ? 0 : index + 1;
      this.currency = this.currencies[index];

      this.$nextTick(() => {
        this.inputAmount = ((this.amount * this.rate) / SATS).toFixed(
          this.decimals
        );
      });
    },

    update(m) {
      let amount = f(this.inputAmount);
      if (isNaN(amount)) amount = 0;

      if (m === '<') {
        amount = Math.floor(this.divisor * (f(amount) / 10)) / this.divisor;
      } else {
        amount = 10 * amount + f(m) / this.divisor;
      }

      if (m === 'C') amount = 0;
      this.inputAmount = amount.toFixed(this.decimals);

      this.$nextTick(() => {
        this.convert(amount);
        this.$emit('input', this.amount, this.fiatAmount, this.currency);
      });
    },
  },

  created: function() {
    document.addEventListener('keyup', this.keyup);
  },

  destroyed: function() {
    document.removeEventListener('keyup', this.keyup);
  },
};
</script>

<style lang="stylus" scoped>
input
  cursor pointer
  width 100%

.toggle
  margin auto 0.25rem !important
  min-width 3rem !important
  width 3rem !important
  height 1.9rem !important

.numpad-button
  height 8vh !important
  min-height 60px
  font-size 18px
  font-weight bolder
</style>
