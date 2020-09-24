<template>
  <div>
    <swap @a1="setA1" @a2="setA2" />

    <v-progress-linear v-if="loading" indeterminate />
    <div v-else-if="bids.length || asks.length">
      <v-card class="mb-1">
        <v-card-text class="white--text flex-grow-1 text-right py-0">
          <v-container class="pa-0">
            <v-row class="font-weight-bold">
              <span style="position: absolute">Swap</span>
              <v-btn icon style="visibility: hidden; height: 0;"><v-icon color="primary">$atom</v-icon></v-btn>
              <v-col>Price</v-col>
              <v-col>Amount</v-col>
              <v-col>Total</v-col>
            </v-row>
            <v-row v-for="p in reverse" :key="p.id" class="hover">
              <v-btn icon><v-icon color="primary">$atom</v-icon></v-btn>
              <v-col class="my-auto">{{ (p.v2 / p.v1).toFixed(8) }}</v-col>
              <v-col class="my-auto">{{ format(p.a1, p.v1) }}</v-col>
              <v-col class="my-auto ml-1" style="position: relative">
                <div class="bid bg" :style="bg(p, bids)" />
                {{ format(p.a1, p.total) }}
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
      <v-card class="mb-1">
        <v-card-text class="white--text flex-grow-1 text-right py-0">
          <v-container class="pa-0">
            <v-row v-for="p in asks" :key="p.id" class="hover">
              <v-btn icon><v-icon color="primary">$atom</v-icon></v-btn>
              <v-col class="my-auto">{{ (p.v2 / p.v1).toFixed(8) }}</v-col>
              <v-col class="my-auto">{{ format(p.a2, p.v2) }}</v-col>
              <v-col class="my-auto ml-1" style="position: relative">
                <div class="ask bg" :style="bg(p, asks)" />
                {{ format(p.a2, p.total) }}
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </div>
    <proposals :proposals="own" class="mb-1" />

    <v-btn @click="$go('/')" class="wide mb-2 mr-2">
      <v-icon>$arrow_back</v-icon>
      Back
    </v-btn>
    <v-btn v-if="user.id" class="mx-auto mb-2 wide" @click="$go('/propose')">
      <v-icon>$add</v-icon>
      <span>New</span>
    </v-btn>
  </div>
</template>

<script>
import { get, sync, call } from 'vuex-pathify';
import Swap from './Swap';
import Proposals from './Proposals';

export default {
  components: { Proposals, Swap },
  data: () => ({
    a1: process.env.VUE_APP_LBTC,
    a2: process.env.VUE_APP_LCAD,
  }),
  computed: {
    assets: get('assets'),
    reverse() {
      let x = [...this.bids];
      return x.reverse();
    },
    loading: get('loading'),
    own() {
      if (!this.user.id) return [];
      return this.proposals.filter(
        p => !p.accepted && p.user_id === this.user.id
      );
    },
    bids() {
      return this.proposals
        .filter(p => !p.accepted && p.a1 === this.a1 && p.a2 === this.a2)
        .sort((a, b) => a.v1 < b.v1)
        .reduce(
          (a, x, i) => [
            ...a,
            { ...x, total: x.v1 + (a[i - 1] ? a[i - 1].total : 0) },
          ],
          []
        );
    },
    asks() {
      return this.proposals
        .filter(p => !p.accepted && p.a1 === this.a2 && p.a2 === this.a1)
        .sort((a, b) => a.v2 < b.v2)
        .reduce(
          (a, x, i) => [
            ...a,
            { ...x, total: x.v2 + (a[i - 1] ? a[i - 1].total : 0) },
          ],
          []
        );
    },
    proposals: sync('proposals'),
    user: get('user'),
  },
  methods: {
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
    bg(p, arr) {
      return { width: `${(p.total / arr[arr.length - 1].total) * 100}%` };
    },
    setA1(a) {
      console.log("setting a1", a);
      this.a1 = a;
    },
    setA2(a) {
      console.log("setting a2", a);
      this.a2 = a;
    },
    getProposals: call('getProposals'),
  },
  async mounted() {
    await this.getProposals();
  },
};
</script>

<style lang="stylus">
.bg
  position absolute
  right -2px
  top -4px
  height 30px
  opacity 0.4

.bid
  background #b71c1c

.ask
  background #4CAF50

.col
  padding 0

.hover
  &:hover
    background #333
</style>
