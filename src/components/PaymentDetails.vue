<template>
  <div>
    <transaction
      v-bind="{ address, amount, fiatAmount }"
      @edit="$emit('edit')"
    />
    <lightning-payment
      v-if="payobj"
      :payobj="payobj"
      v-bind="{ amount, fiatAmount }"
      @editing="$emit('edit')"
    />
    <div v-if="!loading">
      <recipient v-if="recipient" @internal="sendInternal" @pay="sendPayment" />
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
import LightningPayment from './LightningPayment';
import Recipient from './Recipient';
import Transaction from './Transaction';

import { get, call } from 'vuex-pathify';

export default {
  components: {
    LightningPayment,
    Recipient,
    Transaction,
  },

  computed: {
    address: get('address'),
    amount: get('amount'),
    fiatAmount: get('fiatAmount'),
    loading: get('loading'),
    recipient: get('recipient'),
    payobj: get('payobj'),
  },

  methods: {
    sendInternal: call('sendInternal'),
    sendPayment: call('sendPayment'),
  },
};
</script>
