<template>
  <div class="d-flex flex-wrap buttons">
    <v-btn-toggle tile color="primary accent-3" group class="d-flex flex-wrap mx-auto">
    <v-btn
      class="flex-grow-1"
      @click="payment.method = 'url'"
    >
      <v-icon color="pink" left>$gift</v-icon>
      Voucher
    </v-btn>
    <v-btn
      @click="payment.method = 'paper'"
      class="flex-grow-1"
    >
    <v-icon left color="green">$file</v-icon>
      Paper 
    </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script>
import { get, call, sync } from 'vuex-pathify';

export default {
  data() {
    return {
      show: false,
      username: '',
      to: '',
    };
  },
  computed: {
    label() {
      switch (this.payment.network) {
        case 'lightning':
          return 'Invoice';
        case 'bitcoin':
          return 'Address';
        case 'lightning':
          return 'Address';
        default:
          return 'Address, Key, Invoice, Username, BOLT11, BIP21...';
      }
    },
    nodes: get('nodes'),
    payment: sync('payment'),
  },
};
</script>
