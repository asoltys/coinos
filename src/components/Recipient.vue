<template>
  <v-card class="elevation-1 mb-4 pa-4">
    <v-card-text class="white--text text-center">
      <div class="title">Sending to</div>
      <div class="headline yellow--text mb-2">
        {{ payment.recipient.username }}
      </div>
      <div>
        <v-btn
          class="black--text order-first order-sm-last mb-2 mr-2 flex-grow-1"
          color="yellow"
          dark
          @click="$emit('internal')"
        >
          <v-icon class="mr-1">forward</v-icon
          ><span>coinos pay</span>
        </v-btn>
        <v-btn
                  v-if="payment.address || payment.payobj"
          class="order-first order-sm-last mb-2 flex-grow-1"
          color="green"
          dark
          @click="$emit('pay')"
        >
          <v-icon class="mr-1">send</v-icon><span>Pay</span>
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { get } from 'vuex-pathify';
export default {
  computed: {
    payment: get('payment'),
  },
};
</script>
