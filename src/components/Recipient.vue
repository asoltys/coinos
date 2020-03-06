<template>
  <v-card class="elevation-1 pa-2 my-4" v-if="address">
    <div class="mb-4">
      <div class="subtitle-1 font-weight-bold">Recipient</div>
      <code class="black--text mt-2">{{ address }}</code>
    </div>
    <div>
      <div class="subtitle-1 font-weight-bold">Fee</div>
      <span v-if="tx" class="yellow--text font-weight-bold">{{ fee }} sat</span>
      <span v-else class="yellow--text">Automatic</span>
      <v-btn
        class="order-first order-sm-last ml-2 flex-grow-1"
        color="secondary"
        dark
        @click="estimateFee"
      >
        <v-icon class="mr-1">autorenew</v-icon><span>Estimate</span>
      </v-btn>
      <v-btn
        class="order-first order-sm-last ml-2 flex-grow-1"
        color="secondary"
        dark
        @click="sendPayment"
      >
        <v-icon class="mr-1">edit</v-icon><span>Adjust</span>
      </v-btn>
    </div>
  </v-card>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';

const SATS = 100000000;

export default {
  props: {
    address: { type: String },
  },
  computed: {
    confTarget: sync('confTarget'),
    fee() { return this.tx.fee * SATS },
    feeRate: sync('feeRate'),
    mode: sync('mode'),
    tx: get('tx'),
  },
  methods: {
    estimateFee: call('estimateFee'),
  } 
};
</script>

<style lang="stylus" scoped>
.v-application code
  max-width 100%
  word-wrap break-word
  padding 10px
  font-size 1em

.v-application code:before
  display none

@media (max-width: 600px)
  .v-application code
    font-size 0.8em
</style>
