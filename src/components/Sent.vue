<template>
  <div>
    <v-card class="mb-2">
      <v-alert class="headline black--text text-center" color="primary"
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
              <span
                v-if="payment.account.ticker === 'BTC'"
                class="primary--text"
              >
                <span class="display-1">{{ fiat(total) }}</span>
                {{ payment.currency }}
              </span>
            </div>
          </div>
        </div>

        <div class="mb-4 text-center">
          <div class="d-flex justify-center">
            <div class="mr-2">
              <span class="headline grey--text text--lighten-2"
                >+ Network Fee:
              </span>
              <span class="display-1">{{ fee }}</span>
              {{ user.unit }}
            </div>
            <div>
              <span
                v-if="payment.account.ticker === 'BTC'"
                class="primary--text"
              >
                <span class="display-1">{{ fiat(payment.fee) }}</span>
                {{ payment.currency }}
              </span>
            </div>
          </div>
        </div>

        <div
          class="mb-4 text-center"
          v-if="payment.fee_payment"
        >
          <div class="d-flex justify-center">
            <div class="mr-2">
              <span class="headline grey--text text--lighten-2"
                >+ Conversion Fee:
              </span>
              <span class="display-1">{{
                $format(payment.fee_payment.amount, precision)
              }}</span>
              {{ user.unit }}
            </div>
            <div>
              <span
                v-if="payment.account.ticker === 'BTC'"
                class="primary--text"
              >
                <span class="display-1">{{
                  fiat(payment.fee_payment.amount)
                }}</span>
                {{ payment.currency }}
              </span>
            </div>
          </div>
        </div>

        <v-btn @click="home" class="mr-2">
          <v-icon left>$wallet</v-icon><span>Home</span>
        </v-btn>
        <v-btn
          v-if="['bitcoin', 'liquid'].includes(payment.network)"
          @click.native="explore"
        >
          <v-icon left>$open</v-icon><span>Explore</span>
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script>
import { get, call } from 'vuex-pathify';
import Copy from '../mixins/Copy';

export default {
  mixins: [Copy],
  computed: {
    fee() {
      return this.$format(this.payment.fee || 0);
    },
    payment: get('payment'),
    precision() {
      if (this.payment.account.ticker === 'BTC') {
        if (this.user.unit === 'SAT') return 0;
        else if (this.user.unit === 'KSAT') return 3;
        else if (this.user.unit === 'MSAT') return 6;
      }
      return this.payment.account.precision;
    },
    ticker() {
      let { ticker } = this.payment.account;
      if (ticker === 'BTC') return this.user.unit;
      return ticker;
    },
    total() {
      return Math.abs(this.payment.amount);
    },
    user: get('user'),
  },

  methods: {
    home() {
      this.$go('/home');
    },

    fiat(n) {
      if (!n || isNaN(n)) return '0.00';
      return ((n * this.payment.rate) / 100000000).toFixed(2);
    },

    explore() {
      let url = 'https://blockstream.info';
      let { hash, network } = this.payment;
      if (network === 'bitcoin') url += `/tx/${hash}`;
      if (network === 'liquid') url += `${url}/liquid/tx/${hash}`;
      window.open(url, '_blank');
    },

    snack: call('snack'),
  },
};
</script>
