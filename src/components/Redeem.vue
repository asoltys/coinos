<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <v-card v-else-if="payment && payment.account">
      <v-card-text v-if="share" class="title white--text text-center">
        <div class="mb-2">
          Redeem code
          <span
             class="primary--text"
             >{{ payment.redeemcode }}</span
           >
        </div>
            <qr :text="redeemUrl" />
            <v-btn @click="share = false" class="mr-1">
              <v-icon left>$left</v-icon>
              Back
            </v-btn>
            <v-btn @click="copy(redeemUrl)" class="mr-1">
              <v-icon left>$copy</v-icon>
              Copy
            </v-btn>
      </v-card-text>
      <v-card-text v-else class="title white--text text-center">
        <div class="mb-2">
          Redeem Voucher
          <v-card color="secondary" class="ma-4">
            <v-card-text>
              <div
                class="d-flex justify-center display-1 white--text flex-wrap"
              >
                <div class="mr-2 d-flex">
                  <div class="mr-1 my-auto">{{ total }}</div>
                  <div class="my-auto">
                    <v-btn color="white" class="black--text">{{
                      ticker
                    }}</v-btn>
                    <span class="print">{{ ticker }}</span>
                  </div>
                </div>
                <div v-if="ticker === 'BTC'" class="d-flex primary--text">
                  <div class="mr-1 my-auto">{{ fiat }}</div>
                  <div class="my-auto">
                    <v-btn color="primary" class="black--text">{{
                      payment.currency
                    }}</v-btn>
                  </div>
                </div>
              </div>
              <div v-if="payment.memo" class="body-1 pa-4">
                {{ payment.memo }}
              </div>
            </v-card-text>
          </v-card>
        </div>
        <v-alert color="error" v-if="payment.redeemed"
          >Sorry, Already Redeemed</v-alert
        >
        <v-btn v-else @click="redeem(redeemcode)" class="mt-2 mr-1 wide">
          <v-icon color="green" left>$send</v-icon>
          Claim
        </v-btn>
        <v-btn @click="share = true" class="mt-2 wide">
          <v-icon color="primary" left>$qrcode</v-icon>
          Share 
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { get, call } from 'vuex-pathify';
const SATS = 100000000;
import Qr from './Qr';
import Copy from '../mixins/Copy';

export default {
  props: {
    redeemcode: {
      type: String,
      default: null,
    },
  },
  components: { Qr },
  mixins: [Copy],
  data: () => ({
    share: false,
  }),
  computed: {
    redeemUrl() {
      return `${window.location.protocol}//${window.location.host}/redeem/${this.payment.redeemcode}`;
    },
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
