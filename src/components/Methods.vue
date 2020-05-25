<template>
  <div class="d-flex flex-wrap">
    <v-btn
      v-if="networks.includes('bitcoin')"
      class="flex-grow-1 mb-2 mr-1"
      @click="payment.method = 'bitcoin'"
    >
      <img class="mr-1" src="../assets/bitcoin.png" width="30px" />
      <span>Bitcoin</span>
    </v-btn>

    <v-btn
      v-if="networks.includes('lightning')"
      class="flex-grow-1 mb-2 mr-1"
      @click="payment.method = 'lightning'"
    >
      <flash fillColor="yellow" />
      <span>Lightning</span>
    </v-btn>

    <v-btn
      v-if="networks.includes('liquid')"
      class="flex-grow-1 mb-2 mr-1"
      @click="payment.method = 'liquid'"
    >
      <water fillColor="#00aaee" />
      <span>Liquid</span>
    </v-btn>
    <v-btn @click="payment.method = 'paper'" class="flex-grow-1 mr-1">
      <file-outline class="mr-1" />
      Paper Wallet
    </v-btn>
    <v-btn
      v-if="networks.includes('liquid')"
      class="flex-grow-1 mb-2 mr-1"
      @click="payment.method = 'coinos'"
    >
      <v-icon color="yellow">person</v-icon>
      <span>Coinos User</span>
    </v-btn>
    <v-btn class="flex-grow-1 mb-2 mr-1" @click="payment.method = 'voucher'">
      <v-icon color="pink" left>card_giftcard</v-icon>
      Gift Account
    </v-btn>
  </div>
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
import FileOutline from 'vue-material-design-icons/FileOutline';
import Flash from 'vue-material-design-icons/Flash';
import Water from 'vue-material-design-icons/Water';

export default {
  components: { FileOutline, Flash, Water },
  data() {
    return {
      show: false,
      username: '',
      to: '',
    };
  },
  computed: {
    label() {
      switch (this.payment.method) {
        case 'lightning':
          return 'Invoice';
        case 'bitcoin':
          return 'Address';
        case 'lightning':
          return 'Address';
        default:
          return 'Paste an Address, Key, Invoice, Username, BOLT11, BIP21...';
      }
    },
    networks: get('networks'),
    payment: sync('payment'),
  },
};
</script>

<style lang="stylus" scoped>
.v-btn
  width 40%
  max-width 50%
</style>
