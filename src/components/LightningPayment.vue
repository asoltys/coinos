<template>
  <v-card class="elevation-1 my-2 pa-4">
    <div class="text-center font-weight-bold">Pay</div>
    <div v-if="payment.amount" class="d-flex justify-center">
      <div class="mr-2">
        <span class="display-1">{{ payment.amount }}</span> SAT
      </div>
      <div>
        <span class="primary--text">
          <span class="display-1">{{ payment.fiatAmount }}</span>
          {{ user.currency }}
        </span>
      </div>
    </div>
    <amount
      v-else
      v-model.number="amount"
      class="mb-2"
      @done="payment.amount = amount"
      @input="updateAmount"
    />
    <div v-if="fee !== null" class="text-center">
      <div>
        <span class="headline grey--text">+ Routing Fee: </span>
        <span class="headline">{{ fee }}</span> {{ user.unit }}
      </div>
    </div>
    <div class="text-center font-weight-bold my-2">to</div>
    <v-textarea
      label="Lightning Node"
      :value="payment.payobj.payeeNodeKey"
      rows="1"
      auto-grow
      readonly
    >
      <template v-slot:append>
        <v-btn @click="copy(payment.payobj.payeeNodeKey)" icon>
          <v-icon>$copy</v-icon>
        </v-btn>
      </template>
    </v-textarea>
    <v-textarea label="Memo" v-model="payment.memo" rows="1" auto-grow />
    <v-text-field label="Conversion Fee" v-model="conversionFee" readonly>
      <template v-slot:append>
        <v-btn
          class="toggle black--text mt-auto"
          :color="color(feeUnit)"
          @click.prevent="toggleFiat"
          >{{ feeUnit }}</v-btn
        >
        <v-btn icon @click="copy(conversionFee)" class="ml-1" text>
          <v-icon>$copy</v-icon>
        </v-btn>
      </template>
    </v-text-field>
    <div class="d-flex flex-wrap">
      <v-btn
        class="order-first order-sm-last mb-2 flex-grow-1"
        color="green"
        dark
        @click="sendPayment"
      >
        <v-icon left>$send</v-icon><span>Send</span>
      </v-btn>
    </div>
  </v-card>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Amount from './Amount';
const SATS = 100000000;

export default {
  mixins: [Copy],
  components: { Amount },
  data() {
    return {
      amount: 0,
    };
  },
  computed: {
    feeUnit() {
      return this.user.fiat
        ? this.user.currency
        : this.user.unit === 'SAT'
        ? 'SAT'
        : 'BTC';
    },
    fee() {
      if (!this.payment.route) return null;
      return this.$format(parseInt(this.route.total_amt) - this.payment.amount);
    },
    payment: get('payment'),
    rate: get('rate'),
    user: get('user'),
    conversionFeeSAT() {
      let credits = this.user.account['lightning_credits'];
      let conversionFeeSAT = Math.floor(this.payment.amount / 100);
      let conversionFeeDeductionSAT = Math.min(credits, conversionFeeSAT);

      return conversionFeeSAT - conversionFeeDeductionSAT;
    },
    conversionFee() {
      let conversionFee = this.user.fiat
        ? this.conversionFiatFee
        : this.user.unit === 'SAT'
        ? this.conversionFeeSAT
        : this.$format(this.conversionFeeSAT, 8);

      return conversionFee;
    },
    conversionFiatFee() {
      return ((this.conversionFeeSAT * this.rate) / SATS).toFixed(2);
    },
  },
  methods: {
    toggleFiat: call('toggleFiat'),
    toggleUnit: call('toggleUnit'),
    color(c) {
      return ['BTC', 'SAT'].includes(c)
        ? 'white'
        : this.user.currencies.includes(c)
        ? 'primary'
        : 'liquid';
    },
    sendPayment: call('sendPayment'),
    updateAmount(amount, fiatAmount, currency) {
      this.$nextTick(() => {
        this.payment.fiatAmount = fiatAmount;
      });
    },
  },
};
</script>

<style lang="stylus" scoped>
.v-application code
  max-width 100%
  word-wrap break-word
  padding 10px
  font-size 1em

.v-application code:before
  display none

.theme--dark.v-input input
  cursor pointer !important

@media (max-width: 600px)
  .v-application code
    font-size 0.8em

.toggle
  max-height 24px
  margin-top -12px
  margin-bottom 6px
  min-width 44px !important
  width 44px !important
</style>
