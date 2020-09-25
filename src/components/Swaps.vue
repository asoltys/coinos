<template>
  <div>
    <swap @a1="setA1" @a2="setA2" />

    <v-progress-linear v-if="loading" indeterminate />
    <order-book :a1="a1" :a2="a2" />
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
import OrderBook from './OrderBook';

export default {
  components: { OrderBook, Proposals, Swap },
  data: () => ({
    a1: process.env.VUE_APP_LBTC,
    a2: process.env.VUE_APP_LCAD,
  }),
  computed: {
    loading: get('loading'),
    own() {
      if (!this.user.id) return [];
      return this.proposals.filter(
        p => !p.accepted && p.user_id === this.user.id
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
    setA1(a) {
      this.a1 = a;
    },
    setA2(a) {
      this.a2 = a;
    },
    getProposals: call('getProposals'),
  },
  async mounted() {
    await this.getProposals();
  },
};
</script>
