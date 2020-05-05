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
      <div class="d-flex justify-center">
        <div class="mr-2 d-flex">
          <div class="display-1 mr-1 my-auto">{{ total }}</div>
          <v-btn @click="select(ticker)" color="white" class="black--text my-auto">{{ ticker }}</v-btn>
        </div>
        <div>
          <span v-if="payment.account.ticker === 'BTC'" class="yellow--text">
            <span v-if="invoice.amount === payment.amount" class="display-1">{{
              fiatTotal
            }}</span>
            <span v-else class="display-1">{{ fiat }}</span>
            <span v-if="invoice.amount === payment.amount">
              {{ invoice.currency }}</span
            >
            <span v-else> {{ user.currency }}</span>
          </span>
        </div>
      </div>
      <div class="text-center">
        <v-btn class="mt-2" v-if="payment.link" @click="explore(payment.link)">
          <v-icon class="mr-1">open_in_new</v-icon><span>Explore</span>
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script>
import { get, call } from 'vuex-pathify';

const SATS = 100000000;
const f = parseFloat;
let bs = 'https://blockstream.info';

export default {
  computed: {
    total() {
      let { precision } = this.payment.account;
      if (this.payment.account.ticker === 'BTC' && this.user.unit === 'SAT') precision = 0;

      return this.$format(this.payment.amount + this.payment.tip, precision);
    },
    ticker() {
      let { ticker } = this.payment.account;
      if (ticker === 'BTC') return this.user.unit;
      return ticker;
    },
    isBtc() {
      return this.payment.account.ticker === 'BTC';
    },
    fiatTotal() {
      return (f(this.invoice.fiatAmount) + f(this.invoice.fiatTip)).toFixed(2);
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
    payment: get('payment'),
    rate: get('rate'),
    user: get('user'),
  },
  methods: {
    select() {
      this.shiftAccount(this.user.accounts.find(a => a.ticker === this.ticker).asset);
    },
    shiftAccount: call('shiftAccount'),
    explore(link) {
      window.open(link, '_blank');
    },
  },
};
</script>
