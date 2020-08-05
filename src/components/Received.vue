<template>
  <div>
    <v-card class="pb-4 mb-2">
      <v-alert
        v-if="!payment.confirmed"
        class="headline text-center black--text"
        color="orange lighten-2"
      >
        Unconfirmed Payment Detected!
      </v-alert>
      <v-alert v-else class="headline text-center black--text" color="yellow">
        Payment Received!
      </v-alert>
      <div class="d-flex justify-center display-1">
        <div class="mr-2 d-flex">
          <div class="mr-1 my-auto">{{ total }}</div>
          <div class="my-auto">
            <v-btn @click="select(ticker)" color="white" class="black--text">{{
              ticker
            }}</v-btn>
            <span class="print">{{ ticker }}</span>
          </div>
        </div>
        <div v-if="payment.account.ticker === 'BTC'" class="d-flex">
          <div class="yellow--text mr-1 my-auto">
            <span v-if="invoice.amount === payment.amount">{{
              fiatTotal
            }}</span>
            <span v-else>{{ fiat }}</span>
          </div>
          <div class="my-auto">
            <currency-list :currency="currency" :currencies="[]" />
          </div>
        </div>
      </div>
      <div class="text-center">
        <v-btn class="mt-2" v-if="payment.link" @click="explore(payment.link)">
          <v-icon left>$open</v-icon><span>Explore</span>
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script>
import CurrencyList from './CurrencyList';
import { get, call } from 'vuex-pathify';

const SATS = 100000000;
const f = parseFloat;
let bs = 'https://blockstream.info';

export default {
  components: { CurrencyList },
  computed: {
    currency() {
      return this.invoice.amount === this.payment.amount
        ? this.invoice.currency
        : this.user.currency;
    },
    total() {
      let { precision } = this.payment.account;
      if (this.payment.account.ticker === 'BTC' && this.user.unit === 'SAT')
        precision = 0;

      return this.$format(this.payment.amount + this.payment.tip, precision);
    },
    ticker() {
      let { ticker } = this.payment.account;
      if (ticker === 'BTC' && this.user.unit) return this.user.unit;
      return ticker;
    },
    isBtc() {
      return this.payment.account.ticker === 'BTC';
    },
    fiatTotal() {
      let amount = f(this.invoice.fiatAmount || 0);
      let tip = f(this.invoice.fiatTip || 0);
      return (amount + tip).toFixed(2);
    },
    fiat() {
      return (
        ((this.payment.amount + this.payment.tip) / SATS) *
        this.payment.rate
      ).toFixed(2);
    },
    invoice() {
      return this.invoices && this.invoices[0];
    },
    invoices: get('invoices'),
    link() {
      if (!this.isBtc) bs += '/liquid';
      return `${bs}/tx/${payment.hash}`;
    },
    payment: get('received'),
    rate: get('rate'),
    user: get('user'),
  },
  methods: {
    select() {
      const account = this.user.accounts.find(a => a.ticker === this.ticker);
      const { asset } = account;
      if (!asset) asset = 'BTC';
      this.shiftAccount(asset);
    },
    shiftAccount: call('shiftAccount'),
    explore(link) {
      window.open(link, '_blank');
    },
  },
};
</script>
