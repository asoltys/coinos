<template>
  <div>
    <proposal v-if="swapping" :swapping="swapping" :params="{ a1: a2, a2: a1, v1: v2, v2: v1 }" @close="swapping = false" />
    <div class="d-sm-flex flex-wrap flex-sm-nowrap">
      <v-card class="flex-grow-1 mb-sm-2" color="secondary">
        <v-card-text>
          <div class="text-center">
            <v-btn-toggle
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
            :items="accounts"
            @input="$emit('a1', a1)"
          >
            <template v-slot:item="{ item }">
              <div>
                <div class="d-flex">
                  <div class="flex-grow-1 title">{{ item.text }}</div>
                  <v-spacer />
                  <div class="yellow--text mt-auto">{{ item.balance }}</div>
                </div>
                <div class="caption">{{ item.value }}</div>
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
          <v-autocomplete
            v-else
            label="Asset"
            v-model="a2"
            :items="showAll ? all : active"
            @input="$emit('a2', a2)"
          >
            <template v-slot:append-item>
              <div class="d-flex">
                <v-btn
                  @click="showAll = !showAll"
                  class="mx-auto text-center flex-grow-1"
                  text
                >
                  <v-icon v-if="showAll" color="primary">$collapse</v-icon>
                  <v-icon v-else color="primary">$expand</v-icon>
                  Load More
                </v-btn>
              </div>
            </template>
            <template v-slot:item="{ item }">
              <v-list-item-content>
                <v-list-item-title v-text="item.text"></v-list-item-title>
                <v-list-item-subtitle
                  v-text="item.value"
                ></v-list-item-subtitle>
              </v-list-item-content>
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
            v-if="a1 && type === 'sell'"
            v-model.number="v1"
            class="mb-2"
            :currency="ticker(a1)"
            :precision="precision(a1)"
            @input="v1Update"
          />
          <amount
            v-if="a2 !== null && type === 'buy'"
            v-model.number="v2"
            class="mb-2"
            :currency="ticker(a2)"
            :precision="precision(a2)"
            @input="v2Update"
          />
          <v-text-field
            v-if="type === 'buy'"
            label="Price"
            v-model="price"
            @input="priceUpdate"
            ref="buyprice"
          />
        </v-card-text>
      </v-card>
      <div class="flex-shrink-1 text-center mx-auto my-auto">
        <v-btn @click="switcheroo" icon class="my-1">
          <v-icon color="primary" class="d-none d-sm-inline">$swap</v-icon>
          <v-icon color="primary" class="d-sm-none">$swapv</v-icon>
        </v-btn>
      </div>
      <v-card class="flex-grow-1 mb-0 mb-sm-2" color="secondary">
        <v-card-text>
          <div class="text-center">
            <v-btn-toggle
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
            :items="accounts"
            @input="$emit('a1', a1)"
          >
            <template v-slot:item="{ item }">
              <v-list-item-content>
                <v-list-item-title v-text="item.text"></v-list-item-title>
                <v-list-item-subtitle
                  v-text="item.value"
                ></v-list-item-subtitle>
              </v-list-item-content>
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
          <v-autocomplete
            v-else
            label="Asset"
            v-model="a2"
            :items="showAll ? all : active"
            @input="$emit('a2', a2)"
          >
            <template v-slot:append-item>
              <div class="d-flex">
                <v-btn
                  @click="showAll = !showAll"
                  class="mx-auto text-center flex-grow-1"
                  text
                >
                  <v-icon v-if="showAll" color="primary">$collapse</v-icon>
                  <v-icon v-else color="primary">$expand</v-icon>
                  Show All
                </v-btn>
              </div>
            </template>

            <template v-slot:item="{ item }">
              <v-list-item-content>
                <v-list-item-title v-text="item.text"></v-list-item-title>
                <v-list-item-subtitle
                  v-text="item.value"
                ></v-list-item-subtitle>
              </v-list-item-content>
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
            v-if="a2 && type === 'sell'"
            v-model.number="v2"
            class="mb-2"
            :currency="ticker(a2)"
            :key="a2"
            :precision="precision(a2)"
            @input="v2Update"
          />
          <amount
            v-if="a1 && type === 'buy'"
            v-model.number="v1"
            class="mb-2"
            :currency="ticker(a1)"
            :key="a1"
            :precision="precision(a1)"
            @input="v1Update"
          />
          <v-text-field
            v-if="type === 'sell'"
            label="Price"
            v-model="price"
            ref="sellprice"
            @input="priceUpdate"
          />
        </v-card-text>
      </v-card>
    </div>
    <div class="d-flex flex-justify-center my-4">
      <v-btn
        @click="swap"
        class="flex-grow-1 mr-1"
        :loading="loading"
        :disabled="loading"
      >
        <v-icon left color="primary">$atom</v-icon><span>Atomic Swap</span>
      </v-btn>
      <v-btn
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

export default {
  props: {
    bid: { type: Object },
    ask: { type: Object },
  },
  components: { Amount, Proposal },
  mixins: [Copy],

  data: () => ({
    custom: false,
    focused: false,
    price: null,
    icons,
    type: 'sell',
    showAll: false,
    swapping: false,
    loading: false,
    a1: process.env.VUE_APP_LBTC,
    a2: process.env.VUE_APP_LCAD,
    v1: null,
    v2: null,
  }),

  computed: {
    error: sync('error'),
    assets: get('assets'),
    active() {
      return [
        ...new Set([
          ...this.orders.map(p => p.a1),
          ...this.orders.map(p => p.a2),
        ]),
      ]
        .map(asset => ({
          text: `${this.assets[asset].ticker} - ${this.assets[asset].name}`,
          value: asset,
        }))
        .filter(a => a.value !== this.a1);
    },
    all() {
      return Object.keys(this.assets)
        .map(asset => ({
          text: `${this.assets[asset].ticker} - ${this.assets[asset].name}`,
          value: asset,
        }))
        .filter(
          a =>
            this.assets[a.value].ticker &&
            this.assets[a.value].name &&
            a.value !== this.a1
        )
        .sort((a, b) => ('' + a.text).localeCompare(b.text));
    },
    accounts() {
      return this.user.accounts
        .filter(a => a.asset !== this.a2)
        .map(a => ({ text: a.name, value: a.asset, balance: a.balance }))
        .sort((a, b) => ('' + a.text).localeCompare(b.text));
    },

    orders: get('orders'),
    order: sync('order'),
    user: get('user'),
  },

  methods: {
    swap() {
      this.swapping = true;
    },
    priceUpdate() {
      if (!this.price) return;
      this.v2 = Math.round(this.v1 * this.price);
    },
    v1Update(v1) {
      if (!isNaN(this.v2/v1)) this.price = (this.v2 / v1).toFixed(2);
    },
    v2Update(v2) {
      if (!isNaN(v2/this.v1)) this.price = (v2 / this.v1).toFixed(2);
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

    switcheroo() {
      let temp = this.a1;
      this.a1 = this.a2;
      this.a2 = temp;
      temp = this.v1;
      this.v1 = this.v2;
      this.v2 = temp;
      this.$emit('a1', this.a1);
      this.$emit('a2', this.a2);
    },

    async submit() {
      const { a1, a2, v1, v2 } = this;
      this.loading = true;
      if (!v1 || !v2) this.error = 'Amounts must be greater than zero';
      if (this.type === 'sell') await this.createOrder({ a1, a2, v1, v2 });
      else await this.createOrder({ a1: a2, a2: a1, v1: v2, v2: v1 });
      this.prefill();
      this.loading = false;
    },

    withdraw: call('withdraw'),
    prefill() {
      let { bid, ask, type, v1, v2 } = this;
      if (bid && type === 'sell' && !v1) {
        this.v1 = Math.round(bid.v1 * bid.rate);
        this.v2 = Math.round(bid.v2 / bid.rate);
        this.price = (this.v2 / this.v1).toFixed(2);
      }
      if (ask && type === 'buy' && !v2) {
        this.v1 = Math.round(ask.v1 * ask.rate);
        this.v2 = Math.round(ask.v2 / ask.rate);
        this.price = (this.v1 / this.v2).toFixed(2);
      }
    } 
  },

  watch: {
    a1() { 
      this.v1 = this.v2 = 0;
      this.prefill();
    },
    a2() { 
      this.v1 = this.v2 = 0;
      this.prefill() 
    },
    bid(bid) { this.prefill() },
    ask(ask) { this.prefill() },
    type(v) {
      this.focused = false;

      if (v === 'buy') {
        this.v1 = this.ask.v1;
        this.v2 = this.ask.v2;
        this.price = this.ask.rate.toFixed(2);
      } else {
        this.v1 = this.bid.v2;
        this.v2 = this.bid.v1;
        this.price = (this.v2 / this.v1).toFixed(2);
      }
    },
  },

  async mounted() {
    this.order = null;
  },
};
</script>
