<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <v-card v-else-if="payment && payment.account">
      <v-card-text class="title white--text text-center">
        <div class="mb-2">
          Redeem Voucher
          <v-card color="secondary" class="ma-4">
            <v-card-text>
              <div class="d-flex justify-center display-1 white--text flex-wrap">
                <div class="mr-2 d-flex">
                  <div class="mr-1 my-auto">{{ total }}</div>
                  <div class="my-auto">
                    <v-btn
                      color="white"
                      class="black--text"
                      >{{ ticker }}</v-btn
                    >
                    <span class="print">{{ ticker }}</span>
                  </div>
                </div>
                <div v-if="ticker === 'BTC'" class="d-flex">
                  <div class="yellow--text mr-1 my-auto">
                    <span>{{ fiat }}</span>
                    <v-btn
                      color="yellow"
                      class="black--text"
                      >{{ payment.currency }}</v-btn
                    >
                  </div>
                </div>
              </div>
              <div v-if="payment.memo" class="body-1 pa-4">{{ payment.memo }}</div>
            </v-card-text>
          </v-card>
        </div>
        <v-alert color="error" v-if="payment.redeemed">Sorry, Already Redeemed</v-alert>
        <v-btn v-else @click="redeem(redeemcode)" color="green" class="mt-2">
          <v-icon left>send</v-icon>
          Redeem
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { get, call } from 'vuex-pathify';
const SATS = 100000000;

export default {
  props: {
    redeemcode: {
      type: String,
      default: null,
    },
  },
  computed: {
    loading: get('loading'),
    total() {
      let { precision } = this.payment.account;
      return this.$format(-this.payment.amount, precision);
    },
    fiat() {
      return ((-this.payment.amount / SATS) * this.payment.rate).toFixed(2);
    },
    ticker() {
      return this.payment.account.ticker;
    },
    user: get('user'),
    payment: get('payment'),
  },
  methods: {
    getPayment: call('getPayment'),
    redeem: call('redeem'),
  },
  async mounted() {
    await this.getPayment(this.redeemcode);
  },
};
</script>
