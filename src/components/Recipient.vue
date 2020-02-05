<template>
  <v-card class="elevation-1 pa-2 my-4 text-center" v-if="address">
    <v-layout wrap>
      <v-flex>
        <div class="body-1 gray--text">Recipient Address</div>
        <v-divider />
      </v-flex>
      <v-flex xs12>
        <code class="black--text mt-2">{{ address }}</code>
      </v-flex>
      <v-flex v-if="scannedBalance">
        <span class="display-1">&nbsp;{{ scannedBalance }} </span>
        <span>SAT</span>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
export default {
  props: {
    address: { type: String },
    scannedBalance: { type: Number },
  },
};
</script>

<style lang="stylus" scoped>
.v-application code
  max-width 100%
  word-wrap break-word
  font-size 0.8em
</style>
