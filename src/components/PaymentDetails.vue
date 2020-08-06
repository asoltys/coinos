<template>
  <div>
    <div v-if="!loading">
      <transaction @edit="$emit('edit')" @feeRate="estimateFee" />
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
    </div>
  </div>
</template>

<script>
import { get, call } from 'vuex-pathify';
import Transaction from './Transaction';

export default {
  components: {
    Transaction,
  },

  computed: {
    loading: get('loading'),
    payment: get('payment'),
  },

  methods: {
    estimateFee: call('estimateFee'),
    sendPayment: call('sendPayment'),
  },
};
</script>
