<template>
  <div>
    <flash
      v-if="network === 'lightning'"
      fillColor="primary"
      title="Lightning Payment"
    />
    <v-icon v-else-if="network === 'COINOS'" color="#ccc">$forward</v-icon>
    <v-icon v-else-if="network === 'GIFT'" color="primary">$gift</v-icon>
    <v-icon
      v-else-if="network === 'bitcoin'"
      title="Bitcoin Payment"
      >$bitcoin</v-icon>
    <v-icon v-else color="liquid" title="Liquid Payment">$liquid</v-icon>
  </div>
</template>

<script>
export default {
  props: {
    network: { type: String, default: 'BTC' },
  },
};
</script>
