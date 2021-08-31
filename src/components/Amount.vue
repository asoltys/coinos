<template>
  <div>
    <v-dialog
      v-if="editing"
      v-model="editing"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @click:outside="done"
      class="my-auto"
      width="500"
      style="height: 100%"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar color="black">
          <v-btn text @click="cancel">
            <v-icon left color="red">$cancel</v-icon><span>Clear</span>
          </v-btn>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn text @click="done">
              <v-icon left color="primary">$check</v-icon><span>Done</span>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <numpad
            @done="done"
            :currencies="currencies"
            :initialAmount="value"
            :initialRate="rate"
            @input="input"
            :key="editing"
            :precision="precision"
            class="mt-4"
            :type="type"
          />
          <div class="d-flex" v-if="button">
            <v-btn class="flex-grow-1 wide" @click="done">
              <v-icon left color="primary">$check</v-icon><span>Done</span>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-text-field
      v-if="show"
      class="amount"
      :label="label"
      v-model="displayAmount"
      @click="editing = true"
      readonly
      style="color: white"
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

const btc = process.env.VUE_APP_LBTC;
const SATS = 100000000;

export default {
  components: { Numpad },
  mixins: [Copy],
  props: {
    show: { type: Boolean, default: true },
    fiatAmountOverride: { type: String, default: null },
    button: { type: Boolean, default: true },
    currency: { type: String, default: null },
    label: { type: String, default: 'Amount' },
    max: { type: Number, default: null },
    value: { type: Number, default: null },
    triggerEditing: { type: Boolean, default: false },
    precision: { type: Number, default: null },
  },
  data() {
    return {
      editing: this.triggerEditing,
      fixedRate: null,
    };
  },
  computed: {
    type() {
      if (this.currency) return 'accounts';
      return this.user.account.asset === btc ? 'currencies' : 'accounts';
    },
    displayCurrency() {
      if (!this.currency && this.user.fiat && this.user.account.ticker === 'BTC') return this.user.currency;
      if (this.user.unit === 'SAT') return 'SAT';
      if (this.currency) return this.currency;

      if (this.user.account.ticker !== 'BTC') {
        return this.user.account.ticker;
      }

      return this.user.fiat ? this.user.currency : this.user.unit;
    },
    fiatAmount() {
      return (
        this.fiatAmountOverride ||
        ((this.value * this.fixedRate) / SATS).toFixed(2)
      );
    },
    decimals() {
      if (this.currency) {
        if (this.currency === this.user.account.ticker) {
          return this.user.account.precision;
        } else if (this.user.account.ticker === 'BTC') {
          switch (this.user.unit) {
            case 'SAT': return 0;
            case 'KSAT': return 3;
            case 'MSAT': return 6;
            default: return 8;
          }
        }
        let account = this.user.accounts.filter(a => a.ticker === this.currency);
        if (account) return account.precision;
      }
      switch (this.user.unit) {
        case 'SAT': return 0;
        case 'KSAT': return 3;
        case 'MSAT': return 6;
        default: return 8;
      }
    },
    isBtc() {
      return this.user.account.ticker === 'BTC';
    },
    displayAmount() {
      let { decimals, value } = this;
      if (!value) value = 0;
      if (!decimals && decimals !== 0) decimals = 8;

      return this.isBtc && this.user.fiat && !this.currency
        ? this.fiatAmount
        : this.user.unit === 'SAT'
        ? value
        : parseFloat(this.$format(value, decimals)).toFixed(decimals);
    },
    currencies() {
      if (this.currency) return [this.currency, 'SAT'];
      let user = this.user;
      if (user.account.ticker === 'BTC') {
        return [...user.currencies, 'BTC', 'SAT', 'KSAT', 'MSAT'];
      }
      return [user.account.ticker, 'SAT'];
    },
    payment: get('payment'),
    rate: get('rate'),
    user: get('user'),
    fiat: get('user@fiat'),
    userCurrency: get('user@currency'),
  },
  methods: {
    cancel() {
      this.editing = false;
      this.$emit('input', 0, 0, this.currency);
      this.$emit('cancel');
    },
    color(c) {
      if (!this.user.currencies) return 'white';
      return ['BTC', 'SAT', 'KSAT', 'MSAT'].includes(c)
        ? 'white'
        : this.type === "accounts"
        ? 'liquid'
        : 'primary';
    },
    input(amount, fiatAmount, currency, rate) {
      this.fixedRate = rate;
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

  watch: {
    userCurrency() {
      this.fixedRate = this.rate;
    },
    fiat() {
      this.fixedRate = this.rate;
    },
    triggerEditing(v) {
      this.editing = v;
    },
  },

  mounted() {
    this.fixedRate = this.rate;
  },
};
</script>

<style lang="stylus" scoped>
.toggle
  max-height 24px
  margin-top -12px
  margin-bottom 6px
  min-width 44px !important

.v-textarea textarea[readonly="readonly"]
  color #fff;

:not(.v-select).v-text-field input[readonly="readonly"]
  color #fff
</style>
