<template>
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
            <span class="display-1">{{ fiat }}</span>
            {{ user.currency }}
          </span>
        </div>
      </div>
  </v-card>
</template>

<script>
import { get } from 'vuex-pathify';

const SATS = 100000000;

export default {
  computed: {
    fiat() {
      return (((this.payment.amount + this.payment.tip) / SATS) * this.rate).toFixed(2);
    },
    payment() {
      return this.payments[this.payments.length - 1]
    },
    payments: get('payments'),
    rate: get('rate'),
    received: get('received'),
    user: get('user'),
  },
};
</script>
