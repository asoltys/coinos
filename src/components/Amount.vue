<template>
  <div>
    <div v-if="editing">
      <numpad
        class="mb-2"
        @done="editing = false"
        :currencies="currencies"
        :initialAmount="value"
        :initialRate="rate"
        @input="e => $emit('input', e)"
      />
      <div class="d-flex">
        <v-btn
          class="black--text flex-grow-1"
          color="primary"
          dark
          @click="done"
        >
          <v-icon left>check</v-icon><span>Set Amount</span>
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
          class="toggle black--text mt-auto"
          :color="user.fiat ? 'yellow' : 'white'"
          @click.prevent="toggle"
          >{{ user.fiat ? user.currency : user.unit }}</v-btn
        >
        <v-btn icon @click="copy(displayAmount)" class="ml-1" text>
          <v-icon>content_copy</v-icon>
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
    label: { type: String, default: 'Amount' },
    max: { type: Number, default: null },
    value: { type: Number, default: null },
  },
  data() {
    return {
      fiatAmount: null,
      editing: false,
    };
  },
  computed: {
    isBtc() {
      return this.user.account.ticker === 'BTC';
    },
    displayAmount() {
      return this.user.fiat
        ? this.fiatAmount
        : this.user.unit === 'SAT'
        ? this.value
        : this.$format(this.value);
    },
    currencies() {
      let user = this.user;
      if (user.account.ticker === 'BTC') {
        return [...user.currencies, 'SAT', 'BTC'];
      }
      return [user.account.ticker];
    },
    payment: get('payment'),
    rate: get('rate'),
    user: get('user'),
  },
  methods: {
    done() {
      this.$emit('done');
      this.editing = false;
    },
    toggleFiat: call('toggleFiat'),
    setMax() {
      this.$emit('input', this.max);
    },
    toggle() {
      if (this.user.account.ticker !== 'BTC') return;
      this.toggleFiat();
    },
  },
  watch: {
    value(v) {
      this.fiatAmount = ((this.value * this.rate) / SATS).toFixed(2);
    } 
  },
  mounted() {
    this.fiatAmount = ((this.value * this.rate) / SATS).toFixed(2);
  },
};
</script>

<style lang="stylus" scoped>
.toggle
  max-height 24px
  margin-top -12px
  margin-bottom 6px
  min-width 44px !important
  width 44px !important
</style>
