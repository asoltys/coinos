<template>
  <div>
    <div class="d-flex">
      <v-text-field
        class="display-1 flex-grow-1 mb-1"
        hide-details="auto"
        v-model="inputAmount"
        @focus="e => e.target.select()"
        @keyup.enter="done"
        ref="amount"
        solo
      >
        <template v-slot:append>
          <currency-list
            :currency="currency"
            :currencies="currencies"
            @currency="setCurrency"
          />
        </template>
      </v-text-field>
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
import CurrencyList from './CurrencyList';

const f = parseFloat;
const SATS = 100000000;

export default {
  components: { CurrencyList },
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
    this.currency =
      this.fiat && this.currencies.includes(this.user.currency)
        ? this.user.currency
        : this.user.account.ticker;
    this.inputAmount =
      this.fiat && this.fiatAmount
        ? this.fiatAmount
        : this.$format(this.initialAmount) || '_';
  },

  computed: {
    fiat() {
      return (
        this.user.account.ticker === 'BTC' &&
        !['SAT', 'BTC'].includes(this.currency)
      );
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
          if (this.rates[this.currency]) return this.rates[this.currency]
          else return 1;
          break;
      }
    },
    globalRates: get('rates'),
    user: get('user'),
  },

  watch: {
    inputAmount(v) {
      if (v === '_') return;
      this.convert(v);
      this.$nextTick(() => {
        if (
          !this.amount &&
          this.$refs.amount.$refs.input !== document.activeElement
        )
          this.inputAmount = '_';
      });

      if (!this.amount) this.amount = 0;
      if (!this.fiatAmount) this.fiatAmount = 0;
      this.$emit('input', this.amount, this.fiatAmount, this.currency);
    },
  },

  methods: {
    setCurrency(c) {
      this.currency = c;

      this.$nextTick(() => {
        if (this.fiat) {
          this.inputAmount = ((this.amount * this.rate) / SATS).toFixed(
            this.decimals
          );
        }
        else {
          this.inputAmount = (this.amount / this.divisor).toFixed(this.decimals);
        } 

        this.$refs.amount.blur();
      });
    },
    convert(n) {
      if (this.fiat) {
        this.fiatAmount = f(this.inputAmount).toFixed(this.decimals);
        this.amount = Math.round(
          ((parseFloat(this.fiatAmount) * SATS) / this.rate).toFixed(
            this.decimals
          )
        );
      } else {
        if (this.currency === 'SAT') {
          this.amount = Math.round(n);
          this.fiatAmount = f((n * this.globalRate) / SATS).toFixed(2);
        } else {
          this.amount = Math.round(n * this.divisor);
          this.fiatAmount = f((this.amount * this.globalRate) / SATS).toFixed(
            2
          );
        }
      }
    },
    done(e) {
      let amount = e.target.value;
      if (this.fiat)
        this.amount = Math.round(
          ((amount * SATS) / this.rate).toFixed(this.decimals)
        );
      else this.amount = Math.round(amount);
      this.$emit('done');
    },

    id(n) {
      let prefix = 'button-';
      if (n === '<') return prefix + 'lt';
      return prefix + n;
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
    },
  },
};
</script>

<style lang="stylus" scoped>
.numpad-button
  height 8vh !important
  min-height 60px
  font-size 18px
  font-weight bolder
</style>
