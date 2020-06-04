<template>
  <div>
    <transaction
      v-if="!payment.payobj && (payment.address || payment.recipient)"
      @edit="$emit('edit')"
      @feeRate="estimateFee"
    />
    <div v-if="!loading">
      <recipient v-if="payment.recipient" @internal="sendInternal" @pay="sendPayment" />
      <div v-else class="d-flex flex-wrap">
        <v-btn
          class="order-first order-sm-last mb-2 flex-grow-1"
          color="green"
          dark
          @click="sendPayment"
        >
          <v-icon class="mr-1">send</v-icon><span>Pay</span>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import Recipient from './Recipient';
import Transaction from './Transaction';

import { get, call } from 'vuex-pathify';

export default {
  components: {
    Recipient,
    Transaction,
  },

  computed: {
    loading: get('loading'),
    payment: get('payment'),
  },

  methods: {
    estimateFee: call('estimateFee'),
    sendInternal: call('sendInternal'),
    sendPayment: call('sendPayment'),
  },
};
</script>
