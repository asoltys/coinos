<template>
  <div
    v-if="invoice.amount > 0 || invoice.network === 'lightning'"
    class="mb-2"
  >
    <div v-if="invoice.amount > 0" class="d-flex flex-wrap justify-center">
      <div class="d-flex mr-4">
        <div class="display-2 font-weight-black flex-grow-1 text-right mr-2" style="word-break: break-all">
          {{ total }}
        </div>
        <div class="text-left flex-grow-1 my-auto">
          <currency-list :currency="ticker" :currencies="cryptos" type="accounts" />
        </div>
        <span class="print body-1">{{ ticker }}</span>
      </div>
      <!-- <div class="display-1 mr-1"> -->
      <!--   <span>{{ total }}</span> -->
      <!--   <currency-list :currency="ticker" :currencies="cryptos" type="accounts" /> -->
      <!--   <\!-- <v-btn -\-> -->
      <!--   <\!--   class="black--text toggle" -\-> -->
      <!--   <\!--   :color="color(ticker)" -\-> -->
      <!--   <\!--   @click="toggleUnit" -\-> -->
      <!--   <\!--   >{{ ticker }}</v-btn -\-> -->
      <!--   <\!-- > -\-> -->
      <!--   <\!-- <span class="print body-1">{{ ticker }}</span> -\-> -->
      <!-- </div> -->
      <div v-if="isBtc" class="primary--text display-2">
        <span>{{ invoice.fiatAmount }}</span>
        <span v-if="invoice.tip"><span class="headline">+{{ invoice.fiatTip }}</span></span
        >
        <v-btn
          class="black--text toggle pt-5 pb-4"
          color="primary"
          @click="shiftCurrency"
          >{{ invoice.currency }}</v-btn
        >
        <span class="print body-1">{{ invoice.currency }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';
import CurrencyList from './CurrencyList';
const SATS = 100000000;

export default {
  components: { CurrencyList },

  computed: {
    cryptos() {
      let arr = ['SAT', 'KSAT', 'MSAT', 'BTC'];
      arr.splice(arr.indexOf(this.ticker), 1);
      if (!this.user.accounts) return arr;
      arr = [
        ...new Set([
          ...arr,
          ...this.user.accounts.filter(a => !a.hide && a.pubkey === this.user.account.pubkey)
            .map(a => (a.ticker || a.asset.substr(0,3)))
        ]),
      ];

      if (this.ticker === 'BTC') arr.splice(arr.indexOf('BTC'), 1);
      return arr;
    },
    isBtc() {
      return this.user.account.ticker === 'BTC';
    },
    loading: get('loading'),
    networks() {
      return this.nodes.map(n => ({
        text: n[0].toUpperCase() + n.slice(1),
        value: n,
      }));
    },
    nodes: get('nodes'),
    text() {
      return this.invoice.address || this.invoice.text;
    },
    precision() {
      if (this.user.unit === 'SAT') return 0;
      else if (this.user.unit === 'KSAT') return 3;
      else if (this.user.unit === 'MSAT') return 6;
      else return this.user.account.precision;
    },
    ticker() {
      return this.isBtc ? this.user.unit : (this.user.account.ticker || this.user.account.asset.substr(0,3));
    },
    total() {
      return this.$format(this.invoice.amount + this.invoice.tip, this.precision);
    },
    invoice: sync('invoice'),
    user: get('user'),
  },

  methods: {
    color(c) {
      return ['BTC', 'SAT', 'KSAT', 'MSAT'].includes(c)
        ? 'white'
        : this.user.currencies.includes(c)
        ? 'primary'
        : 'liquid';
    },
    clearInvoice: call('clearInvoice'),
    setCurrency: call('setCurrency'),
    shiftCurrency: call('shiftCurrency'),
    toggleUnit: call('toggleUnit'),
  },
};
</script>

<style lang="stylus" scoped>
.toggle
  margin auto 0.25rem !important
  margin-top -0.3rem !important
  height 1.7rem !important
</style>
