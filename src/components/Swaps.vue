<template>
  <div>
    <exchange />
    <swap :bid="bids[0]" :ask="asks[asks.length - 1]" />
    <v-progress-linear v-if="loading" indeterminate />
    <v-tabs v-model="tab" hide-slider prev-icon="">
      <v-tabs-slider color="primary"></v-tabs-slider>
      <v-tab v-for="t in tabs" :key="t">
        {{ t }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item key="Order Book">
        <order-book :bids="bids" :asks="asks" />
      </v-tab-item>
      <v-tab-item key="Your">
        <orders :orders="own" class="mb-1" />
      </v-tab-item>
      <v-tab-item key="Last">
        <last-trades :orders="completed" class="mb-1" />
      </v-tab-item>
    </v-tabs-items>
    <div class="d-flex">
      <v-btn class="flex-grow-1 mr-1 mb-1 mb-md-0 wide" @click="$go('/funding')">
        <v-icon left>$canada</v-icon>
        NEW! CAD Funding and Withdrawals
      </v-btn>
      </div>
  </div>
</template>

<script>
import { get, sync, call } from 'vuex-pathify';
import Exchange from './Exchange';
import Swap from './Swap';
import Orders from './Orders';
import LastTrades from './LastTrades';
import OrderBook from './OrderBook';

const SATS = 100000000;

export default {
  props: {
    t1: { type: String },
    t2: { type: String },
  },
  components: { Exchange, OrderBook, Orders, LastTrades, Swap },
  data: () => ({
    tab: null,
    tabs: ['Order Book', 'Your Orders', 'Last'],
  }),
  computed: {
    assets: get('assets'),
    a1: sync('a1'),
    a2: sync('a2'),
    loading: get('loading'),
    bids() {
      return this.orders
        .filter(p => !p.accepted && p.a1 === this.a2 && p.a2 === this.a1)
        .sort((a, b) =>
          a.rate === b.rate ? a.id - b.id : a.rate > b.rate ? 1 : -1
        )
        .reduce(
          (a, x, i) => [
            ...a,
            { ...x, total: x.v2 + (a[i - 1] ? a[i - 1].total : 0) },
          ],
          []
        );
    },
    asks() {
      let asks = [
        ...this.orders
          .filter(p => !p.accepted && p.a1 === this.a1 && p.a2 === this.a2)
          .sort((a, b) =>
            a.rate === b.rate ? a.id - b.id : a.rate > b.rate ? 1 : -1
          )
          .reduce(
            (a, x, i) => [
              ...a,
              { ...x, total: x.v1 + (a[i - 1] ? a[i - 1].total : 0) },
            ],
            []
          ),
      ].reverse();

      return asks;
    },
    own() {
      if (!this.user.id) return [];
      return [
        ...this.orders
          .filter(
            p =>
              !p.accepted &&
              p.user_id === this.user.id &&
              p.a1 === this.a1 &&
              p.a2 === this.a2
          )
          .map(p => ({ ...p, type: 'sell' })),
        ...this.orders
          .filter(
            p =>
              !p.accepted &&
              p.user_id === this.user.id &&
              p.a1 === this.a2 &&
              p.a2 === this.a1
          )
          .map(p => ({ ...p, rate: 1 / p.rate, type: 'buy' })),
      ];
    },
    completed() {
      let d = (n, p) => {
        if (!p) return '';
        let r = p.a1 === n.a1 ? p.rate : Math.round(SATS / p.rate) / SATS;
        if (r.toFixed(8) === n.rate.toFixed(8)) return '';
        return r < n.rate ? 'up' : 'down';
      };

      return [
        ...this.orders
          .filter(
            p =>
              p.accepted &&
              ((p.a1 === this.a1 && p.a2 === this.a2) ||
                (p.a1 === this.a2 && p.a2 === this.a1))
          )
          .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))
          .reduce((a, x, i) => [...a, { ...x, direction: d(x, a[i - 1]) }], [])
          .reverse(),
      ].splice(0, 5);
    },
    orders: sync('orders'),
    user: get('user'),
  },
  methods: {
    setA1(a) {
      this.a1 = a;
    },
    setA2(a) {
      this.a2 = a;
    },
    getOrders: call('getOrders'),
  },
  async mounted() {
    if (this.t1) { 
      let a = Object.values(this.assets).find(a => a.ticker === this.t1);
      if (a) this.a1 = a.asset_id;
    }

    console.log(this.a1);
    console.log(this.t2, Object.values(this.assets).map(a => a.ticker).filter(t => t.startsWith("USD")));

    if (this.t2) {
      let a = Object.values(this.assets).find(a => a.ticker === this.t2);
      console.log("a", a);
      if (a) this.a2 = a.asset_id;
    } 

    console.log(this.a2);

    await this.getOrders();
  },
};
</script>

<style>
.v-slide-group__prev {
display: none !important;
}
</style>

