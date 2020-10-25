<template>
  <div>
    <v-list>
      <v-list-item two-line @click="$go(`/markets/${m.a1.substr(0, 6)}-${m.a2.substr(0,6)}`)" v-for="m in markets" :key="m.a1 + m.a2">
        <v-list-item-content>
          <div class="d-flex">
            <div class="d-flex flex-wrap">
              <div class="d-flex mr-2">
                <div class="my-auto">
                  <div class="title">{{ m.t1 }}</div>
                  <div class="caption primary--text text-center" style="margin-top: -10px">{{ m.a1.substr(0, 6) }}</div>
                </div>
                <img v-if="icons[m.a1]"
                  class="my-auto ml-1 py-1"
                  :src="
                    `data:image/png;base64, ${icons[m.a1]}`
                  "
                  style="max-width: 1.8em"
                />
              </div>
              <div class="d-flex mr-2">
                <div class="my-auto">
                  <div class="title">{{ m.t2 }}</div>
                  <div class="caption primary--text text-center" style="margin-top: -10px">{{ m.a2.substr(0, 6) }}</div>
                </div>
                <img v-if="icons[m.a2]"
                  class="my-auto py-1 ml-1"
                  :src="
                    `data:image/png;base64, ${icons[m.a2]}`
                  "
                  style="max-width: 1.8em"
                />
              </div>
            </div>
            <div class="ml-auto my-auto">
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
  props: {
    markets: { type: Array },
  },
  data: () => ({
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
