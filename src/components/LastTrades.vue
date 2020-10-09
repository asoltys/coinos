<template>
  <v-card v-if="orders.length">
    <v-card-text class="white--text">
      <h2>Last Trades</h2>
      <v-container class="pb-0 text-right">
        <v-row>
          <v-col>Time</v-col>
          <v-col>Amount</v-col>
          <v-col>Price</v-col>
        </v-row>
        <v-row v-for="p in orders" :key="p.id">
          <v-col class="mr-1">
            <v-icon v-if="(p.a1 === a1 && p.direction === 'up') || (p.a2 === a1 && p.direction === 'down')" color="green">$up</v-icon> 
            <v-icon v-if="(p.a1 === a1 && p.direction === 'down') || (p.a2 === a1 && p.direction === 'up')" color="red">$down</v-icon> 
            {{ dateFormat(p.completedAt) }}
          </v-col>
          <v-col class="mr-1">{{ p.a1 === a1 ? format(p.a1, p.v1) : format(p.a2, p.v2) }}</v-col>
          <v-col>{{ price(p) }}</v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import { get, sync, call } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import { format } from 'date-fns';

export default {
  props: {
    orders: {
      type: Array,
      default: () => [],
    },
    a1: {
      type: String
    },
  },
  mixins: [Copy],
  data() {
    return {
      accepting: false,
    };
  },
  computed: {
    assets: get('assets'),
    user: get('user'),
  },
  methods: {
    color(p) {
      if (p.direction === 'up') return 'green';
      return 'red';
    },
    dateFormat(d) {
      return format(d, 'HH:mm:ss');
    },
    price(p) {
      let price = p.v2 / p.v1;
      if (p.a2 === this.a1) price = p.v1 / p.v2;
      return parseFloat(price.toFixed(8));
    },
    getAssets: call('getAssets'),
    accept: call('accept'),
    deleteOrder: call('deleteOrder'),
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

  async mounted() {
    await this.getAssets();
  },
};
</script>
