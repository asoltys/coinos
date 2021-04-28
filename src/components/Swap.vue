<template>
  <div>
    <proposal
      v-if="swapping"
      :swapping="swapping"
      :params="{ a1: a2, a2: a1, v1: v2, v2: v1 }"
      @close="swapping = false"
    />
    <div class="d-sm-flex flex-wrap flex-sm-nowrap" style="flex-basis: fill">
      <v-card class="flex-grow-1 mb-sm-2" color="secondary">
        <v-card-text>
          <div class="text-center">
            <v-btn-toggle
              v-if="!selectOnly"
              v-model="type"
              tile
              color="primary accent-3"
              group
              mandatory
            >
              <v-btn value="buy">
                Buy
              </v-btn>

              <v-btn value="sell">
                Sell
              </v-btn>
            </v-btn-toggle>
          </div>
          <v-autocomplete
            v-if="type === 'sell'"
            label="Asset"
            v-model="a1"
            :items="selectOnly ? all : accounts"
          >
            <template v-slot:append>
              <div>
                <div v-if="a1Acc" class="font-weight-bold">
                  {{
                    user.unit === 'SAT'
                      ? a1Acc.balance
                      : $format(a1Acc.balance, a1Acc.precision)
                  }}
                </div>
                <div class="caption primary--text">
                  {{ a1 && a1.substr(0, 8) }}
                </div>
              </div>
            </template>
            <template v-slot:item="{ item }">
              <div>
                <div class="d-flex">
                  <div class="flex-grow-1 title">{{ item.text }}</div>
                  <v-spacer />
                  <div class="mt-auto font-weight-bold">{{ item.balance }}</div>
                </div>
                <div class="caption primary--text">{{ item.value }}</div>
              </div>
              <v-list-item-action>
                <v-avatar>
                  <img
                    v-if="icons[item.value]"
                    class="ma-2"
                    :src="`data:image/png;base64, ${icons[item.value]}`"
                  />
                </v-avatar>
              </v-list-item-action>
            </template>
          </v-autocomplete>
          <v-autocomplete v-else label="Asset" v-model="a2" :items="all">
            <template v-slot:append>
              <div class="caption primary--text text-center mt-1">
                {{ a2 && a2.substr(0, 8) }}
              </div>
            </template>
            <template v-slot:item="{ item }">
              <div>
                <div class="d-flex">
                  <div class="flex-grow-1 title">{{ item.text }}</div>
                  <v-spacer />
                  <div class="mt-auto font-weight-bold">{{ item.balance }}</div>
                </div>
                <div class="caption primary--text">{{ item.value }}</div>
              </div>
              <v-list-item-action>
                <v-avatar>
                  <img
                    v-if="icons[item.value]"
                    class="ma-2"
                    :src="`data:image/png;base64, ${icons[item.value]}`"
                  />
                </v-avatar>
              </v-list-item-action>
            </template>
          </v-autocomplete>

          <amount
            v-if="a1 && type === 'sell' && !selectOnly"
            v-model.number="v1"
            class="mb-2"
            :currency="ticker(a1)"
            :precision="precision(a1)"
            @input="v1Update"
          />
          <amount
            v-if="a2 !== null && type === 'buy' && !selectOnly"
            v-model.number="v2"
            class="mb-2"
            :currency="ticker(a2)"
            :precision="precision(a2)"
            @input="v2Update"
          />
          <v-text-field
            v-if="!selectOnly"
            label="Price"
            v-model="inversePrice"
            @input="inversePriceUpdate"
            ref="buyprice"
          >
            <template v-slot:append>
              {{ `${ticker(a1)}/${ticker(a2)}` }}
            </template>
          </v-text-field>
        </v-card-text>
      </v-card>
      <div class="flex-shrink-1 text-center mx-auto my-auto">
        <v-btn @click="flip" icon class="my-1">
          <v-icon color="primary" class="d-none d-sm-inline">$swap</v-icon>
          <v-icon color="primary" class="d-sm-none">$swapv</v-icon>
        </v-btn>
      </div>
      <v-card class="flex-grow-1 mb-0 mb-sm-2" color="secondary">
        <v-card-text>
          <div class="text-center">
            <v-btn-toggle
              v-if="!selectOnly"
              v-model="type"
              tile
              color="primary accent-3"
              group
              mandatory
            >
              <v-btn value="buy">
                With
              </v-btn>

              <v-btn value="sell">
                For
              </v-btn>
            </v-btn-toggle>
          </div>

          <v-autocomplete
            v-if="type === 'buy'"
            label="Asset"
            v-model="a1"
            :items="selectOnly ? all : accounts"
          >
            <template v-slot:append>
              <div>
                <div v-if="a1Acc" class="font-weight-bold">
                  {{
                    user.unit === 'SAT'
                      ? a1Acc.balance
                      : $format(a1Acc.balance, a1Acc.precision)
                  }}
                </div>
                <div class="caption primary--text">
                  {{ a1 && a1.substr(0, 8) }}
                </div>
              </div>
            </template>
            <template v-slot:item="{ item }">
              <div>
                <div class="d-flex">
                  <div class="flex-grow-1 title">{{ item.text }}</div>
                  <v-spacer />
                  <div class="mt-auto font-weight-bold">{{ item.balance }}</div>
                </div>
                <div class="caption primary--text">{{ item.value }}</div>
              </div>
              <v-list-item-action>
                <v-avatar>
                  <img
                    v-if="icons[item.value]"
                    class="ma-2"
                    :src="`data:image/png;base64, ${icons[item.value]}`"
                  />
                </v-avatar>
              </v-list-item-action>
            </template>
          </v-autocomplete>
          <v-autocomplete v-else label="Asset" v-model="a2" :items="all">
            <template v-slot:append>
              <div class="caption primary--text text-center mt-1">
                {{ a2 && a2.substr(0, 8) }}
              </div>
            </template>
            <template v-slot:item="{ item }">
              <div>
                <div class="d-flex">
                  <div class="flex-grow-1 title">{{ item.text }}</div>
                  <v-spacer />
                  <div class="mt-auto font-weight-bold">{{ item.balance }}</div>
                </div>
                <div class="caption primary--text">{{ item.value }}</div>
              </div>
              <v-list-item-action>
                <v-avatar>
                  <img
                    v-if="icons[item.value]"
                    class="ma-2"
                    :src="`data:image/png;base64, ${icons[item.value]}`"
                  />
                </v-avatar>
              </v-list-item-action>
            </template>
          </v-autocomplete>
          <amount
            v-if="a2 && type === 'sell' && !selectOnly"
            v-model.number="v2"
            class="mb-2"
            :currency="ticker(a2)"
            :key="a2"
            :precision="precision(a2)"
            @input="v2Update"
          />
          <amount
            v-if="a1 && type === 'buy' && !selectOnly"
            v-model.number="v1"
            class="mb-2"
            :currency="ticker(a1)"
            :key="a1"
            :precision="precision(a1)"
            @input="v1Update"
          />
          <v-text-field
            v-if="!selectOnly"
            label="Price"
            v-model="price"
            ref="sellprice"
            @input="priceUpdate"
          >
            <template v-slot:append>
              {{ `${ticker(a2)}/${ticker(a1)}` }}
            </template>
          </v-text-field>
        </v-card-text>
      </v-card>
    </div>
    <div class="d-flex flex-justify-center my-4">
      <v-btn
        v-if="selectOnly"
        @click="$go(`/markets/${a1.substr(0, 6)}-${a2.substr(0, 6)}`)"
        class="flex-grow-1"
        :loading="loading"
        :disabled="loading"
      >
        <v-icon left color="primary">$send</v-icon><span>Go</span>
      </v-btn>
      <v-btn
        v-else
        @click="submit"
        class="flex-grow-1"
        :loading="loading"
        :disabled="loading"
      >
        <v-icon left color="primary">$send</v-icon><span>Place Order</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import icons from '../icons.json';
import Amount from './Amount';
import { get, call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Proposal from './Proposal';

const SATS = 100000000;
const btc = process.env.VUE_APP_LBTC;
const lcad = process.env.VUE_APP_LCAD;

export default {
  props: {
    bid: { type: Object },
    ask: { type: Object },
    selectOnly: { type: Boolean, default: false },
  },
  components: { Amount, Proposal },
  mixins: [Copy],

  data: () => ({
    custom: false,
    focused: false,
    inversePrice: null,
    price: null,
    icons,
    swapping: false,
    loading: false,
    v1: null,
    v2: null,
  }),

  computed: {
    inverse: sync('inverse'),
    type: sync('type'),
    a1Acc() {
      return this.user.accounts.find(a => a.asset === this.a1);
    },
    a1: sync('a1'),
    a2: sync('a2'),
    error: sync('error'),
    assets: get('assets'),
    all() {
      return Object.keys(this.assets)
        .map(asset => {
          const account = this.user.accounts.find(a => a.asset === asset);
          let balance = null;
          if (account) ({ balance } = account);
          return {
            text: `${this.assets[asset].ticker} - ${this.assets[asset].name}`,
            value: asset,
            balance,
          };
        })
        .filter(
          a =>
            this.assets[a.value].ticker &&
            this.assets[a.value].name &&
            (this.selectOnly || a.value !== this.a1)
        )
        .sort((a, b) => ('' + a.text).localeCompare(b.text));
    },
    accounts() {
      let accounts = this.user.accounts
        .filter(a => a.asset !== this.a2 && !a.hide)
        .map(a => ({
          text: `${a.ticker} - ${a.name}`,
          value: a.asset,
          balance: a.balance,
        }));

      if (this.a1 && this.assets[this.a1]) {
        let { name: text, asset: value } = this.assets[this.a1];
        if (!accounts.find(a => a.value === this.a1))
          accounts.push({ text, value, balance: 0 });
      }

      return accounts.sort((a, b) => ('' + a.text).localeCompare(b.text));
    },

    orders: get('orders'),
    order: sync('order'),
    user: get('user'),
  },

  methods: {
    swap() {
      this.swapping = true;
    },
    inversePriceUpdate(v) {
      if (!v) return;

      if (this.type === 'sell') {
        this.v2 = Math.round(this.v1 / v);
      } else {
        this.v1 = Math.round(this.v2 * v);
      }
      this.price = (1 / v).toFixed(8);
    },
    priceUpdate(v) {
      if (!v) return;
      if (this.type === 'sell') {
        this.v2 = Math.round(this.v1 * v);
      } else {
        this.v1 = Math.round(this.v2 / v);
      }
      this.inversePrice = (1 / v).toFixed(8);
    },
    v1Update(v1) {
      if (v1 && this.v2) {
        if (this.type === 'sell') {
          this.v2 = Math.round(this.price * v1);
        } else {
          this.price = (this.v2 / v1).toFixed(8);
          this.inversePrice = (v1 / this.v2).toFixed(8);
        }
      }
    },
    v2Update(v2) {
      if (v2 && this.v1) {
        if (this.type === 'sell') {
          this.price = (v2 / this.v1).toFixed(8);
          this.inversePrice = (this.v1 / v2).toFixed(8);
        } else {
          this.v1 = (v2 / this.price).toFixed(8);
        }
      }
    },
    precision(asset) {
      return this.assets[asset] ? this.assets[asset].precision : 0;
    },
    ticker(asset) {
      if (asset === process.env.VUE_APP_LBTC) return 'BTC';
      return this.assets[asset]
        ? this.assets[asset].ticker || asset.substr(0, 3).toUpperCase()
        : '';
    },

    createOrder: call('createOrder'),

    flip() {
      let segments = window.location.pathname.split('/');
      let last = segments[segments.length - 1];
      let t1 = last.split('-')[0];
      let t2 = last.split('-')[1];

      if (!(t1 && t2)) return this.switcheroo();

      if (this.a2.startsWith(t1)) this.switcheroo();
      else this.$go(`/markets/${t2}-${t1}`);
    },

    switcheroo() {
      let temp = this.a1;
      this.a1 = this.a2;
      this.a2 = temp;
      temp = this.v1;
      this.v1 = this.v2;
      this.v2 = temp;
    },

    async submit() {
      const { a1, a2, v1, v2 } = this;
      this.loading = true;
      if (!v1 || !v2) this.error = 'Amounts must be greater than zero';
      await this.createOrder({ a1, a2, v1, v2 });
      this.prefill();
      this.loading = false;
    },

    withdraw: call('withdraw'),
    prefill() {
      let { bid, ask, type, v1, v2 } = this;
      if (bid && type === 'sell' && !v1) {
        this.v1 = Math.round(bid.v1 * bid.rate);
        this.v2 = Math.round(bid.v2 / bid.rate);
        this.price = (this.v2 / this.v1).toFixed(8);
        this.inversePrice = (this.v1 / this.v2).toFixed(8);
      }
      if (ask && type === 'buy' && !v2) {
        this.v1 = bid.v1;
        this.v2 = bid.v2;
        this.price = (this.v1 / this.v2).toFixed(8);
        this.inversePrice = (this.v2 / this.v1).toFixed(8);
      }
    },
  },

  watch: {
    a1(a1) {
      this.v1 = this.v2 = this.price = this.inversePrice = 0;
      this.prefill();
      console.log(window.location.pathname);
      window.history.pushState(
        undefined,
        undefined,
        window.location.pathname.replace(/.*-/, `${a1.substr(0, 6)}-`)
      );
    },
    a2(a2) {
      this.v1 = this.v2 = this.price = this.inversePrice = 0;
      this.prefill();
      window.history.pushState(
        undefined,
        undefined,
        window.location.pathname.replace(/-.*$/, `-${a2.substr(0, 6)}`)
      );
    },
    bid(bid) {
      this.prefill();
    },
    ask(ask) {
      this.prefill();
    },
    type(v) {
      this.inverse = !this.inverse;
      this.switcheroo();
      this.focused = false;

      this.$nextTick(() => {
        if (v === 'buy') {
          this.v1 = this.bid.v2;
          this.v2 = this.bid.v1;
          this.price = (1 / this.bid.rate).toFixed(8);
          this.inversePrice = this.bid.rate.toFixed(8);
        } else {
          this.v1 = this.ask.v1;
          this.v2 = this.v1 / this.bid.rate;
          this.price = (this.v1 / this.v2).toFixed(8);
          this.inversePrice = (this.v2 / this.v1).toFixed(8);
        }
      });
    },
  },

  mounted() {
    this.prefill();
  },
};
</script>
