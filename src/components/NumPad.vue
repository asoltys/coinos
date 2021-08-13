<template>
  <div>
    <div class="d-flex">
      <v-text-field
        class="headline flex-grow-1 mb-1"
        hide-details="auto"
        v-model="inputAmount"
        @focus="e => e.target.select()"
        @keyup.enter="done"
        ref="amount"
        placeholder="_"
        solo
      >
        <template v-slot:append>
          <currency-list
            :currency="currency"
            :currencies="currencies"
            @currency="setCurrency"
        :type="type"
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
        <v-icon v-else style="max-width: 14px">$undo</v-icon>
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
    type: { type: String },
    initialAmount: { type: Number },
    initialRate: { type: Number },
    currencies: { type: Array },
    precision: { type: Number, default: null },
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
      inputAmount: '',
      buttons: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '<', '0', 'C'],
      codes: Array.from(Array(10), (_, x) => x + 48),
      currency: '',
      rates: [],
    };
  },

  async mounted() {
    const waitForRates = resolve => {
      if (!this.globalRates)
        return (this.timeout = setTimeout(() => waitForRates(resolve), 1000));
      resolve();
    };
    await new Promise(waitForRates);
    this.rates = this.globalRates;
    this.currency =
      this.user.fiat && this.currencies.includes(this.user.currency) && this.type === 'currencies'
        ? this.user.currency
        : this.user.account.ticker === 'BTC'
        ? this.user.unit
        : !this.currencies.includes(this.user.currency)
        ? this.currencies[0]
        : this.user.account.ticker ||
          this.user.account.asset.substr(0, 3).toUpperCase();
    this.inputAmount =
      this.currency === 'SAT'
        ? this.initialAmount
        : this.user.fiat &&
          this.fiatAmount &&
          this.currencies.includes(this.user.currency) && this.type === 'currencies'
        ? this.fiatAmount
        : parseFloat(this.$format(this.initialAmount, this.decimals)).toFixed(
            this.decimals
          ) || '';

    if (
      this.$refs.amount &&
      (this.user.fiat || !['BTC', 'SAT', 'KSAT', 'MSAT', 'GSAT', 'TSAT'].includes(this.currency))
    ) {
      setTimeout(() => {
        this.$refs.amount.$refs.input.select();
      }, 50);
    }
  },

  computed: {
    decimals() {
      if (this.currency === 'SAT') return 0;
      else if (this.currency === 'KSAT') return 3;
      else if (this.currency === 'MSAT') return 6;
      else if (this.currency === 'GSAT') return 9;
      else if (this.currency === 'TSAT') return 12;
      if (this.precision || this.precision === 0) return this.precision;
      if (this.type === "currencies" && this.user.currencies.includes(this.currency)) return 2;
      let account = this.user.accounts.find(a => a.ticker === this.currency);
      if (account) return account.precision;
      if (this.user.account.ticker !== 'BTC')
        return this.user.account.precision;

      return 2;
    },
    divisor() {
      return 10 ** this.decimals;
    },
    fiat() {
      return this.user.currencies.includes(this.currency) && this.type === 'currencies';
    },
    globalRate: get('rate'),
    rate() {
      switch (this.currency) {
        case 'SAT':
          return SATS;
          break;
        case 'KSAT':
          return SATS / 1e3;
          break;
        case 'MSAT':
          return SATS / 1e6;
          break;
        case 'GSAT':
          return SATS / 1e9;
          break;
        case 'TSAT':
          return SATS / 1e12;
          break;
        case 'BTC':
          return 1;
          break;
        default:
          if (this.rates[this.currency]) return this.rates[this.currency];
          else return 1;
          break;
      }
    },
    globalRates: get('rates'),
    user: get('user'),
  },

  watch: {
    inputAmount(v) {
      if (v === '') return;
      this.convert(v);
      this.$nextTick(() => {
        if (
          !this.amount &&
          this.$refs.amount &&
          this.$refs.amount.$refs.input !== document.activeElement
        ) {
          this.inputAmount = '';
        }
      });

      if (!this.amount) this.amount = 0;
      if (!this.fiatAmount) this.fiatAmount = 0;
      this.$emit(
        'input',
        this.amount,
        this.fiatAmount,
        this.currency,
        this.rate
      );
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
        } else {
          this.inputAmount = (this.amount / this.divisor).toFixed(
            this.decimals
          );
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
  max-width 33%
</style>
