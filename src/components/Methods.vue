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
      class="flex-grow-1 mb-2 mr-1 wide"
      @click="payment.method = 'coinos'"
      :style="buttonStyle"
    >
      <v-icon color="yellow">$account</v-icon>
      <span>Coinos User</span>
    </v-btn>
    <v-btn
      @click="payment.method = 'paper'"
      class="flex-grow-1 mb-2 mr-1 wide"
      :style="buttonStyle"
    >
      <file-outline fillColor="#4CAF50" class="mr-1" />
      Paper Wallet
    </v-btn>
  </div>
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
import FileOutline from 'vue-material-design-icons/FileOutline';

export default {
  components: { FileOutline },
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
      switch (this.payment.method) {
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
