<template>
  <div>
    <h1>Markets</h1>
    <v-list>
      <v-list-item two-line @click="$go('/markets/LBTC-LCAD')">
        <v-list-item-content>
          <div class="d-flex">
            <div class="d-flex">
              <div class="d-flex mr-2">
                <img
                  class="my-auto mr-1"
                  :src="
                    `data:image/png;base64, ${icons['0e99c1a6da379d1f4151fb9df90449d40d0608f6cb33a5bcbfc8c265f42bab0a']}`
                  "
                  style="max-width: 2em"
                />
                <div class="title my-auto">CAD</div>
              </div>
              <div class="d-flex">
                <img
                  class="my-auto mr-1"
                  :src="
                    `data:image/png;base64, ${icons['6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d']}`
                  "
                  style="max-width: 2em"
                />
                <div class="title my-auto">BTC</div>
              </div>
            </div>
            <div class="ml-auto">
              <div class="d-flex">
                <div class="green--text my-auto mr-1">Bid:</div>
                <div class="title">{{ cadbid }}</div>
              </div>
              <div class="d-flex">
                <div class="red--text my-auto mr-1">Ask:</div>
                <div class="title">{{ cadask }}</div>
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

export default {
  data: () => ({
    icons,
    lcad,
    btc,
  }),
  computed: {
    cadask() {
      let orders = this.orders
        .filter(p => p.a1 === btc && p.a2 === lcad)
        .sort((a, b) =>
          a.rate === b.rate ? a.id - b.id : a.rate > b.rate ? 1 : -1
        );
      if (orders.length) {
        let { v1, v2 } = orders[0];
        return v2 / v1;
      }
      return 0;
    },
    cadbid() {
      let orders = this.orders
        .filter(p => p.a2 === btc && p.a1 === lcad)
        .sort((a, b) =>
          a.rate === b.rate ? a.id - b.id : a.rate > b.rate ? 1 : -1
        );
      if (orders.length) {
        let { v1, v2 } = orders[0];
        return v1 / v2;
      }
      return 0;
    },
    orders: sync('orders'),
  },
};
</script>
