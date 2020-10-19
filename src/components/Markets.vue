<template>
  <div>
    <v-list>
      <v-list-item two-line @click="$go(`/markets/${m.t1}-${m.t2}`)" v-for="m in markets" :key="m.t1 + m.t2">
        <v-list-item-content>
          <div class="d-flex">
            <div class="d-flex">
              <div class="d-flex mr-2">
                <img
                  class="my-auto mr-1"
                  :src="
                    `data:image/png;base64, ${icons[m.a2]}`
                  "
                  style="max-width: 2em"
                />
                <div class="title my-auto">{{ m.t2 }}</div>
              </div>
            </div>
            <div class="ml-auto">
              <div class="d-flex">
                <div class="green--text my-auto mr-1">Buy:</div>
                <div class="title">{{ ask(m) }}</div>
              </div>
              <div class="d-flex">
                <div class="red--text my-auto mr-1">Sell:</div>
                <div class="title">{{ bid(m) }}</div>
              </div>
            </div>
          </div>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { get, sync, call } from 'vuex-pathify';
import icons from '../icons.json';
const btc = process.env.VUE_APP_LBTC;
const lcad = process.env.VUE_APP_LCAD;
const usdt = process.env.VUE_APP_USDT;

export default {
  data: () => ({
    markets: [{
      a1: btc,
      a2: lcad,
      t1: 'BTC',
      t2: 'LCAD',
    },
    {
      a1: btc,
      a2: usdt,
      t1: 'BTC',
      t2: 'USDt',
    }], 
    icons,
    lcad,
    btc,
  }),
  methods: {
    ask(m) {
      let orders = this.orders
        .filter(p => p.a1 === m.a2 && p.a2 === m.a1)
        .sort((a, b) =>
          a.rate === b.rate ? a.id - b.id : a.rate > b.rate ? 1 : -1
        );
      if (orders.length) {
        let { v1, v2 } = orders[0];
        return v1 / v2;
      }
      return 0;
    },
    bid(m) {
      let orders = this.orders
        .filter(p => p.a1 === m.a1 && p.a2 === m.a2)
        .sort((a, b) =>
          a.rate === b.rate ? a.id - b.id : a.rate > b.rate ? 1 : -1
        );
      if (orders.length) {
        let { v1, v2 } = orders[0];
        return v2 / v1;
      }
      return 0;
    },
  },
  computed: {
    assets: get('assets'),
    orders: sync('orders'),
  },
};
</script>
