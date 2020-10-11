<template>
  <div>
    <v-card class="mb-1">
      <v-card-text class="white--text flex-grow-1 py-0" v-if="asks.length || bids.length">
        <h2 class="text-center mb-2">Order Book</h2>
        <v-container class="pa-0 text-right">
          <v-row class="font-weight-bold">
            <v-col @click="priceToggle" style="cursor: pointer">Price</v-col>
            <v-col>Amount</v-col>
            <v-col>Total</v-col>
          </v-row>
          <v-row v-for="p in asks" :key="p.id" class="hover">
            <v-col class="my-auto">
              {{ (inverse ? 1 / p.rate : p.rate).toFixed(8) }}
            </v-col>
            <v-col class="my-auto">{{ format(p.a1, p.v1) }}</v-col>
            <v-col class="my-auto ml-1" style="position: relative">
              <div class="ask bg" :style="bg(p, asks)" />
              {{ format(p.a1, p.total) }}
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-text class="white--text" v-else>
        <h2 class="mb-2 text-center">No Orders Yet</h2>
      </v-card-text>
    </v-card>
    <v-card class="mb-1" v-if="bids.length">
      <v-card-text class="white--text flex-grow-1 text-right py-0">
        <v-container class="pa-0">
          <v-row v-for="p in bids" :key="p.id" class="hover">
            <v-col class="my-auto">
              {{ (inverse ? p.rate : 1 / p.rate).toFixed(8) }}
            </v-col>
            <v-col class="my-auto">{{ format(p.a2, p.v2) }}</v-col>
            <v-col class="my-auto ml-1" style="position: relative">
              <div class="bid bg" :style="bg(p, bids)" />
              {{ format(p.a2, p.total) }}
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';

export default {
  props: {
    bids: { type: Array },
    asks: { type: Array },
  },
  data: () => ({
    inverse: false,
  }),
  computed: {
    a1: get('a1'),
    a2: get('a2'),
    assets: get('assets'),
    proposals: get('proposals'),
  },
  methods: {
    priceToggle() {
      this.inverse = !this.inverse;
    },
    bg(p, arr) {
      let total = Math.max(arr[0].total, arr[arr.length - 1].total);
      return { width: `${(p.total / total) * 100}%` };
    },
    format(asset, value) {
      let precision = 0,
        ticker;
      let obj = this.assets[asset];
      if (obj) ({ precision, ticker } = obj);
      if (value)
        return parseFloat(this.$format(value, precision)).toFixed(precision);
      if (ticker) return ticker;
      return asset.substr(0, 3);
    },
  },
};
</script>

<style lang="stylus">
.bg
  position absolute
  right -4px
  top 2px
  height 18px
  opacity 0.4

.ask
  background #e71c1c

.bid
  background #4CeF60

.col
  padding 0

.hover
  &:hover
    background #333
</style>
