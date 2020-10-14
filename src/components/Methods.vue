<template>
  <div class="d-flex flex-wrap buttons">
    <v-btn
      class="flex-grow-1 mb-2 mr-1 wide"
      @click="payment.method = 'url'"
      :style="buttonStyle"
    >
      <v-icon color="pink" left>$gift</v-icon>
      Voucher
    </v-btn>
    <v-btn
      @click="payment.method = 'paper'"
      class="flex-grow-1 mb-2 mr-1 wide"
      :style="buttonStyle"
    >
    <v-icon left color="green">$file</v-icon>
      Paper Wallet
    </v-btn>
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
    buttonStyle() {
      return {
        maxWidth: `${(100 / (window.innerWidth < 600 ? 1 : 2)).toFixed(0)}%`,
      };
    },
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

<style lang="stylus" scoped>
@media (max-width: 600px)
  .buttons .v-btn
    max-width none
    width 100%
    height 62px !important

.buttons .v-btn
  height 8vh !important
  min-height 60px
</style>
