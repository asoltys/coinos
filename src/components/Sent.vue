<template>
  <v-card class="mb-2">
    <v-alert class="headline black--text text-center" color="yellow"
      >Sent!</v-alert
    >
    <div class="pa-4">
      <div class="mb-2">
        <div class="d-flex justify-center">
          <div class="mr-2">
            <span class="display-1">{{ $format(total, precision) }}</span>
            {{ ticker }}
          </div>
          <div>
            <span v-if="payment.account.ticker === 'BTC'" class="yellow--text">
              <span class="display-1">{{ fiat(total) }}</span>
              {{ payment.currency }}
            </span>
          </div>
        </div>
      </div>

      <div class="mb-4 text-center">
        <div class="d-flex justify-center">
          <div class="mr-2">
            <span class="headline grey--text text--lighten-2">+ Fee: </span>
            <span class="display-1">{{ fee }}</span>
            {{ user.unit }}
          </div>
          <div>
            <span v-if="payment.account.ticker === 'BTC'" class="yellow--text">
              <span class="display-1">{{ fiat(payment.fee) }}</span>
              {{ payment.currency }}
            </span>
          </div>
        </div>
      </div>

      <v-btn @click="clearPayment" class="mr-2">
        <v-icon class="mr-2">arrow_back</v-icon><span>Send Another</span>
      </v-btn>
      <v-btn v-if="payment.txid" @click="link(payment.txid)">
        <v-icon class="mr-2">open_in_new</v-icon><span>Blockchain</span>
      </v-btn>
    </div>
  </v-card>
</template>

<script>
import { get, call } from 'vuex-pathify';

export default {
  computed: {
    fee() {
      return this.$format(this.payment.fee || 0);
    },
    payment: get('payment'),
    precision() {
      let { precision } = this.payment.account;
      if (this.payment.account.ticker === 'BTC' && this.user.unit === 'SAT')
        precision = 0;
      return precision;
    },
    ticker() {
      let { ticker } = this.payment.account;
      if (ticker === 'BTC') return this.user.unit;
      return ticker;
    },
    total() {
      let total = Math.abs(this.payment.amount);
      if (this.payment.account.ticker === 'BTC') {
        total -= this.payment.fee;
      }

      return total;
    },
    user: get('user'),
  },

  methods: {
    clearPayment: call('clearPayment'),

    fiat(n) {
      if (!n || isNaN(n)) return '0.00';
      return ((n * this.payment.rate) / 100000000).toFixed(2);
    },

    link(tx) {
      let bs = 'https://blockstream.info';
      if (
        this.$prod ||
        window.location.href.includes('test')
      )
        bs += '/testnet';
      window.location = `${bs}/tx/${tx}`;
    },

    snack: call('snack'),
  },
};
</script>
