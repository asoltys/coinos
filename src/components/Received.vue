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
      <div v-if="payment.asset.substr(-3) === 'BTC'" class="d-flex justify-center">
        <div class="mr-2">
          <span class="display-1">{{ payment.amount + payment.tip }}</span> SAT
        </div>
        <div>
          <span class="yellow--text">
            <span v-if="invoice.amount === payment.amount" class="display-1">{{
              total
            }}</span>
            <span v-else class="display-1">{{ fiat }}</span>
            <span v-if="invoice.amount === payment.amount">
              {{ invoice.currency }}</span
            >
            <span v-else> {{ user.currency }}</span>
          </span>
        </div>
      </div>
      <div v-else class="text-center">
        <h1>Asset</h1>
        <code class="black--text mb-2">{{ payment.asset }}</code>
        <div class="mr-2">
          <span class="display-1">{{ payment.amount + payment.tip }}</span> UNITS
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
import { get } from 'vuex-pathify';

const SATS = 100000000;
const f = parseFloat;
let bs = 'https://blockstream.info';

export default {
  computed: {
    total() {
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
    payment() {
      let payment = this.payments[0];
      if (!['BTC', 'LNBTC'].includes(payment.asset)) bs += '/liquid';
      payment.link = `${bs}/tx/${payment.hash}`;
      return payment;
    },
    payments: get('payments'),
    rate: get('rate'),
    user: get('user'),
  },
  methods: {
    explore(link) {
      window.open(link, '_blank');
    },
  },
};
</script>
