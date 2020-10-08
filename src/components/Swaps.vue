<template>
  <div>
    <swap @a1="setA1" @a2="setA2" :bid="bids[0]" :ask="asks[asks.length - 1]" />

    <v-progress-linear v-if="loading" indeterminate />
    <order-book :a1="a1" :a2="a2" :bids="bids" :asks="asks" />
    <orders :proposals="own" class="mb-1" />
    <last-trades :proposals="completed" :a1="a1" class="mb-1" />
  </div>
</template>

<script>
import { get, sync, call } from 'vuex-pathify';
import Swap from './Swap';
import Orders from './Orders';
import LastTrades from './LastTrades';
import OrderBook from './OrderBook';

const SATS = 100000000;

export default {
  components: { OrderBook, Orders, LastTrades, Swap },
  data: () => ({
    a1: process.env.VUE_APP_LBTC,
    a2: process.env.VUE_APP_LCAD,
  }),
  computed: {
    loading: get('loading'),
    bids() {
      return this.proposals
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
        ...this.proposals
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
        ...this.proposals
          .filter(
            p =>
              !p.accepted &&
              p.user_id === this.user.id &&
              p.a1 === this.a1 &&
              p.a2 === this.a2
          )
          .map(p => ({ ...p, type: 'sell' })),
        ...this.proposals
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
        ...this.proposals
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
    proposals: sync('proposals'),
    user: get('user'),
  },
  methods: {
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
