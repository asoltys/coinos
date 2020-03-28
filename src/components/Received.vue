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
        <div class="mr-2">
          <span class="display-1">{{ payment.amount + payment.tip }}</span> SAT
        </div>
        <div>
          <span class="yellow--text">
            <span v-if="invoice.amount === payment.amount" class="display-1">{{ total }}</span>
            <span v-else class="display-1">{{ fiat }}</span>
            <span v-if="invoice.amount === payment.amount"> {{ invoice.currency }}</span>
            <span v-else> {{ user.currency }}</span>
          </span>
        </div>
      </div>
    </v-card>
    <v-btn @click="$emit('clear')" class="mb-2">
      <v-icon>arrow_back</v-icon><span>Go Back</span>
    </v-btn>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';

const SATS = 100000000;
const f = parseFloat;

export default {
  computed: {
    total() {
      return (f(this.invoice.fiatAmount) + f(this.invoice.fiatTip)).toFixed(2);
    },
    fiat() {
      return (
        ((this.payment.amount + this.payment.tip) / SATS) *
        this.rate
      ).toFixed(2);
    },
    invoice() {
      return this.invoices && this.invoices[0]
    },
    invoices: get('invoices'),
    payment() {
      return this.payments[this.payments.length - 1];
    },
    payments: get('payments'),
    rate: get('rate'),
    user: get('user'),
  },
};
</script>
