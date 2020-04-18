<template>
  <v-card class="mb-2">
    <v-card-title>Server Balances</v-card-title>
    <v-progress-linear v-if="loading" indeterminate />
    <v-card-text v-else-if="stats">
      <v-card class="mb-2" color="secondary">
        <v-card-text class="white--text">
          <div class="d-flex">
            <h4 class="flex-grow-1">Bitcoin</h4>
            <h4 class="text-right flex-grow-1">{{ stats.bitcoin }}</h4>
          </div>
          <div class="d-flex">
            <h4 class="flex-grow-1">Liquid Bitcoin</h4>
            <h4 class="text-right flex-grow-1">{{ stats.liquid }}</h4>
          </div>
          <div class="d-flex">
            <h4 class="flex-grow-1">Lightning Wallet</h4>
            <h4 class="text-right flex-grow-1">{{ stats.lnwallet }}</h4>
          </div>
          <div class="d-flex mb-4">
            <h4 class="flex-grow-1">Lightning Channels</h4>
            <h4 class="text-right flex-grow-1">{{ stats.lnchannel }}</h4>
          </div>
          <div class="d-flex">
            <h4 class="flex-grow-1">Total Hot Wallets</h4>
            <h4 class="text-right flex-grow-1">{{ stats.total }}</h4>
          </div>
          <div class="d-flex mb-4">
            <h4 class="flex-grow-1">Total User Account Balances</h4>
            <h4 class="text-right flex-grow-1">{{ stats.user }}</h4>
          </div>
          <div class="d-flex">
            <h4 class="flex-grow-1">Reserve Ratio</h4>
            <h4 class="text-right flex-grow-1">{{ stats.ratio }}%</h4>
          </div>
        </v-card-text>
      </v-card>
      <v-card color="secondary">
        <v-card-text class="white--text">
          <div class="d-flex" v-for="a in assets" :key="a">
            <h4 class="flex-grow-1">
              <v-icon color="green" class="mr-1">account_balance_wallet</v-icon>
              <span class="wrap">{{ a }}</span>
            </h4>
            <h4 class="text-right flex-grow-1">{{ stats.assets[a] }}</h4>
          </div>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script>
import { get, call } from 'vuex-pathify';

export default {
  computed: {
    assets() {
      let assets = Object.keys(this.stats.assets);
      assets.shift();
      return assets;
    },
    loading: get('loading'),
    stats: get('stats'),
  },
  methods: {
    getStats: call('getStats'),
  },
  mounted() {
    this.getStats();
  },
};
</script>

<style lang="stylus" scoped>
h4
 max-width 80%

.wrap
  max-width 100%
  word-wrap break-word
</style>
