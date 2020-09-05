<template>
  <div>
    <div v-if="editing">
      <numpad
        class="mb-2"
        @done="editing = false"
        :currencies="currencies"
        :initialAmount="value"
        :initialRate="rate"
        @input="input"
        :key="editing"
      />
      <div class="d-flex" v-if="button">
        <v-btn
          class="flex-grow-1"
          @click="done"
        >
          <v-icon left color="yellow">$check</v-icon><span>Set Amount</span>
        </v-btn>
      </div>
    </div>
    <v-text-field
      v-else
      class="amount"
      :label="label"
      v-model="displayAmount"
      readonly
      @click="editing = true"
    >
      <template v-slot:append>
        <v-btn v-if="max" @click="setMax" class="ml-1" text>
          Max
        </v-btn>
        <v-btn
          v-if="user.account.ticker !== 'BTC' || currency"
          class="toggle black--text mt-auto"
          :color="color(displayCurrency)"
          @click.prevent="toggleUnit"
          >{{ displayCurrency }}</v-btn
        >
        <v-btn
          v-else
          class="toggle black--text mt-auto"
          :color="color(displayCurrency)"
          @click.prevent="toggleFiat"
          >{{ displayCurrency }}</v-btn
        >
        <v-btn icon @click="copy(displayAmount)" class="ml-1" text>
          <v-icon>$copy</v-icon>
        </v-btn>
      </template>
    </v-text-field>
  </div>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';
import Numpad from './NumPad';
import Copy from '../mixins/Copy';

const SATS = 100000000;

export default {
  components: { Numpad },
  mixins: [Copy],
  props: {
    button: { type: Boolean, default: true },
    currency: { type: String, default: null },
    label: { type: String, default: 'Amount' },
    max: { type: Number, default: null },
    value: { type: Number, default: null },
    startEditing: { type: Boolean, default: false },
  },
  data() {
    return {
      editing: this.startEditing,
    };
  },
  computed: {
    displayCurrency() {
      if (this.user.unit === 'SAT' && !this.user.fiat) return 'SAT';
      if (this.currency) return this.currency;

      if (this.user.account.ticker !== 'BTC') {
        return this.user.account.ticker;
      }
      
      return this.user.fiat ? this.user.currency : this.user.unit;
    },
    fiatAmount() {
      return ((this.value * this.rate) / SATS).toFixed(2);
    },
    precision() {
      if (this.currency) {
        let account = this.user.accounts.find(a => a.ticker === this.currency);
        if (account) return account.precision;
      } 
      return 8;
    },
    isBtc() {
      return this.user.account.ticker === 'BTC';
    },
    displayAmount() {
      let { precision, value } = this;
      if (!value) value = 0;
      if (!precision && precision !== 0) precision = 8;

      return this.user.fiat && !this.currency
        ? this.fiatAmount
        : this.user.unit === 'SAT'
        ? value
        : parseFloat(this.$format(value, precision)).toFixed(precision);
    },
    currencies() {
      if (this.currency) return [this.currency, 'SAT'];
      let user = this.user;
      if (user.account.ticker === 'BTC') {
        return [...user.currencies, 'SAT', 'BTC'];
      }
      return [user.account.ticker, 'SAT'];
    },
    payment: get('payment'),
    rate: get('rate'),
    user: get('user'),
  },
  methods: {
    color(c) {
      return ['BTC', 'SAT'].includes(c)
        ? 'white'
        : this.user.currencies.includes(c)
        ? '#ffeb3b'
        : '#0ae';
    },
    input (amount, fiatAmount, currency) {
      this.$emit('input', amount, fiatAmount, currency);
    }, 
    done() {
      this.$emit('done');
      this.editing = false;
    },
    toggleFiat: call('toggleFiat'),
    setMax() {
      this.$emit('input', this.max);
    },
    toggleUnit: call('toggleUnit'),
  },
};
</script>

<style lang="stylus" scoped>
.toggle
  max-height 24px
  margin-top -12px
  margin-bottom 6px
  min-width 44px !important
</style>
