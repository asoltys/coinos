<template>
  <v-card class="elevation-1 mb-4 pa-4">
    <v-card-text class="white--text text-center">
      <div class="headline mb-2">
        Sending to
        <span class="yellow--text">{{ payment.recipient.username }}</span>
      </div>
      <amount
        v-model.number="payment.amount"
        class="mb-2"
        @done="$emit('feeRate')"
      />
      <div>
        <v-btn
          class="order-first order-sm-last mb-2 flex-grow-1"
          color="green"
          dark
          @click="send"
        >
          <v-icon left>$send</v-icon><span>Send</span>
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
    payment: get('payment'),
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
