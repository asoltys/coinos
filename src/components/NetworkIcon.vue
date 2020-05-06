<template>
  <div>
    <flash
      v-if="network === 'LNBTC'"
      fillColor="yellow"
      title="Lightning Payment"
    />
    <v-icon v-else-if="network === 'COINOS'" color="#ccc">forward</v-icon>
    <v-icon v-else-if="network === 'GIFT'" color="yellow">card_giftcard</v-icon>
    <img
      v-else-if="network === 'BTC'"
      src="../assets/bitcoin.png"
      width="24px"
      title="Bitcoin Payment"
    />
    <water v-else fillColor="#00aaee" title="Liquid Payment" />
  </div>
</template>

<script>
import Water from 'vue-material-design-icons/Water';
import Flash from 'vue-material-design-icons/Flash';

export default {
  components: { Flash, Water },
  props: {
    network: { type: String, default: 'BTC' },
  },
};
</script>
