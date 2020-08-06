<template>
  <v-card class="elevation-1 my-2 pa-4">
    <div class="text-center font-weight-bold">Pay</div>
    <div v-if="payment.amount" class="d-flex justify-center">
      <div class="mr-2">
        <span class="display-1">{{ payment.amount }}</span> SAT
      </div>
      <div>
        <span class="yellow--text">
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

export default {
  mixins: [Copy],
  components: { Amount },
  data() {
    return {
      amount: 0,
    };
  },
  computed: {
    fee() {
      if (!this.payment.route) return null;
      return this.$format(parseInt(this.route.total_amt) - this.payment.amount);
    },
    payment: get('payment'),
    rate: get('rate'),
    user: get('user'),
  },
  methods: {
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
