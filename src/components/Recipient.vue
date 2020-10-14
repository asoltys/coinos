<template>
  <v-card class="elevation-1 mb-4 pa-4">
    <v-card-text class="white--text text-center">
      <div class="headline mb-2" v-if="payment.recipient.username">
        Sending to
        <span class="primary--text">{{ payment.recipient.username }}</span>
      </div>
      <amount
        v-model.number="payment.amount"
        class="mb-2"
        @done="$emit('feeRate')"
        :currency="currency"
      />
      <div class="d-flex">
        <v-btn
          class="mr-1 flex-grow-1"
          @click="$go('/send?refresh')"
        >
          <v-icon left>$left</v-icon><span>Back</span>
        </v-btn>
        <v-btn
          class="flex-grow-1"
          @click="send"
        >
          <v-icon color="success" left>$send</v-icon><span>Send</span>
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { get } from 'vuex-pathify';
import Amount from './Amount';

export default {
  components: { Amount },
  computed: {
    currency() {
      if (this.user.account.ticker === 'BTC') return null;
      else return this.user.account.ticker;
    },
    payment: get('payment'),
    user: get('user'),
  },
  methods: {
    send() {
      if (this.payment.recipient) {
        this.$emit('internal');
      } else {
        this.$emit('pay');
      }
    },
  },
};
</script>
