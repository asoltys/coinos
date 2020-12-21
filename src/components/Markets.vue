<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <div v-else>
      <div class="d-flex mb-4">
        <v-btn
          class="flex-grow-1 mr-1 mb-1 mb-md-0 wide"
          @click="$go('/funding')"
        >
          <v-icon left>$canada</v-icon>
          New! CAD Funding and Withdrawals
        </v-btn>
      </div>
      <div v-if="invalid">Market Not Found</div>
      <market-list v-if="orders.length && (!t1 || conflict)" :markets="markets" />
      <div v-else-if="a1 && a2">
        <swap :bid="bids[0]" :ask="asks[asks.length - 1]" />
        <v-tabs v-model="tab" hide-slider prev-icon="">
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
      </div>
    </div>
  </div>
</template>

<script>
import { get, sync, call } from 'vuex-pathify';
import MarketList from './MarketList';
import Swap from './Swap';
import Orders from './Orders';
import LastTrades from './LastTrades';
import OrderBook from './OrderBook';

const SATS = 100000000;
const btc = process.env.VUE_APP_LBTC;
const lcad = process.env.VUE_APP_LCAD;
const usdt = process.env.VUE_APP_USDT;
const eur = process.env.VUE_APP_EUR;

export default {
  props: {
    t1: { type: String },
    t2: { type: String },
  },
  components: { MarketList, OrderBook, Orders, LastTrades, Swap },
  data: () => ({
    loading: false,
    conflict: false,
    markets: [
      {
        a1: btc,
        a2: lcad,
        t1: 'BTC',
        t2: 'CAD',
      },
      {
        a1: btc,
        a2: eur,
        t1: 'BTC',
        t2: 'EUR',
      },
      {
        a1: btc,
        a2: usdt,
        t1: 'BTC',
        t2: 'USDt',
      },
    ],
    invalid: false,
    tab: null,
    tabs: ['Order Book', 'Your Orders', 'Last'],
  }),
  computed: {
    assets: get('assets'),
    a1: sync('a1'),
    a2: sync('a2'),
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
    getOrders: call('getOrders'),
  },
  async mounted() {
    await this.getOrders();

    let { t1, t2 } = this;
    if (!(t1 && t2)) return;

    this.loading = true;
    const waitForAssets = resolve => {
      if (!(this.assets && Object.values(this.assets).length))
        return (this.timeout = setTimeout(() => waitForAssets(resolve), 1000));
      resolve();
    };
    await new Promise(waitForAssets);

    let assets = Object.values(this.assets);
    let a1Candidates = assets.filter(a => a.ticker === t1);
    let a2Candidates = assets.filter(a => a.ticker === t2);

    if (!a1Candidates.length)
      a1Candidates = assets.filter(a => a.asset && a.asset.startsWith(t1));
    if (!a2Candidates.length)
      a2Candidates = assets.filter(a => a.asset && a.asset.startsWith(t2));

    if (a1Candidates.length === 1 && a2Candidates.length === 1) {
      this.a1 = a1Candidates[0].asset;
      this.a2 = a2Candidates[0].asset;
    } else if (a1Candidates.length >= 1 && a2Candidates.length >= 1) {
      this.conflict = true;
      this.markets = [];
      a1Candidates.map(({ asset: a1 }) => {
        a2Candidates.map(({ asset: a2 }) => {
          this.markets = [
            ...this.markets,
            {
              a1,
              a2,
              t1,
              t2,
            },
          ];
        });
      });
    } else {
      this.invalid = true;
    }

    this.loading = false;
  },
};
</script>

<style>
.v-slide-group__prev {
  display: none !important;
}
</style>
