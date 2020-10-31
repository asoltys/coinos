<template>
  <div>
    <proposal
      v-if="swapping"
      :swapping="swapping"
      :params="{ a1: a2, a2: a1, v1: v2, v2: v1 }"
      @close="swapping = false"
    />
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
          >
            <template v-slot:append>
              <div>
                <div v-if="a1Acc" class="font-weight-bold">{{ user.unit === 'SAT' ? a1Acc.balance : $format(a1Acc.balance, a1Acc.precision) }}</div>
                <div class="caption primary--text">{{ a1.substr(0, 8) }}</div>
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
                {{ a2.substr(0, 8) }}
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
        <v-btn @click="flip" icon class="my-1">
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
          >
            <template v-slot:append>
              <div>
                <div v-if="a1Acc" class="font-weight-bold">{{ user.unit === 'SAT' ? a1Acc.balance : $format(a1Acc.balance, a1Acc.precision) }}</div>
                <div class="caption primary--text">{{ a1.substr(0, 8) }}</div>
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
                {{ a2.substr(0, 8) }}
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
        <v-icon left color="pink">$atom</v-icon><span>Atomic Swap</span>
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
const btc = process.env.VUE_APP_LBTC;
const lcad = process.env.VUE_APP_LCAD;

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
    swapping: false,
    loading: false,
    v1: null,
    v2: null,
  }),

  computed: {
    type: sync('type'),
    a1Acc() {
      return this.user.accounts.find(a => a.asset === this.a1)
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
            a.value !== this.a1
        )
        .sort((a, b) => ('' + a.text).localeCompare(b.text));
    },
    accounts() {
      let accounts = this.user.accounts
        .filter(a => a.asset !== this.a2 && !a.hide)
        .map(a => ({ text: `${a.ticker} - ${a.name}`, value: a.asset, balance: a.balance }));

      let { name: text, asset: value } = this.assets[this.a1];
      if (!accounts.find(a => a.value === this.a1))
        accounts.push({ text, value, balance: 0 });

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
    priceUpdate() {
      if (!this.price) return;
      this.v2 = Math.round(this.v1 * this.price);
    },
    v1Update(v1) {
      if (v1 && this.v2) this.price = (this.v2 / v1).toFixed(8);
    },
    v2Update(v2) {
      if (v2 && this.v1) this.price = (v2 / this.v1).toFixed(8);
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
      let { t1, t2 } = this.$router.currentRoute.params;
      this.$go(`/markets/${t2}-${t1}`);
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
        this.price = (this.v2 / this.v1).toFixed(8);
      }
      if (ask && type === 'buy' && !v2) {
        this.v1 = ask.v1
        this.v2 = ask.v2
        this.price = (this.v2 / this.v1).toFixed(8);
      }
    },
  },

  watch: {
    a1(a1) {
      this.v1 = this.v2 = 0;
      this.prefill();
    },
    a2(a2) {
      this.v1 = this.v2 = 0;
      this.prefill();
    },
    bid(bid) {
      this.prefill();
    },
    ask(ask) {
      this.prefill();
    },
    type(v) {
      this.switcheroo();
      this.focused = false;

      if (v === 'buy') {
        this.v1 = this.ask.v1;
        this.v2 = this.ask.v2;
        this.price = this.ask.rate.toFixed(8);
      } else {
        this.v1 = this.bid.v2;
        this.v2 = this.bid.v1;
        this.price = (this.v2 / this.v1).toFixed(8);
      }
    },
  },

  mounted() {
    this.prefill();
  } 
};
</script>
