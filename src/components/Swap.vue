<template>
  <div>
    <div class="d-sm-flex flex-wrap flex-sm-nowrap">
      <v-card class="flex-grow-1 mb-sm-2" color="secondary">
        <v-card-text>
          <div class="text-center">
            <v-btn-toggle v-model="type" tile color="primary accent-3" group>
              <v-btn value="buy">
                Buy
              </v-btn>

              <v-btn value="sell">
                Sell
              </v-btn>
            </v-btn-toggle>
          </div>
          <v-autocomplete
            label="Asset"
            v-model="a1"
            :items="accounts"
            @input="$emit('a1', a1)"
            @change="showAsset = true"
          >
            <template v-slot:item="{ item }">
              <img
                v-if="icons[item.value]"
                class="ma-2"
                :src="
                  `data:image/png;base64, ${icons['6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d']}`
                "
                width="22px"
              />
              <v-list-item-content>
                <v-list-item-title v-text="item.text"></v-list-item-title>
                <v-list-item-subtitle
                  v-text="item.value"
                ></v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon>$settings</v-icon>
              </v-list-item-action>
            </template>
          </v-autocomplete>

          <v-textarea
            label="Asset ID"
            v-if="showAsset"
            v-model="a1"
            auto-grow
            rows="1"
          />
          <amount
            v-if="a1"
            v-model.number="v1"
            class="mb-2"
            :currency="ticker(a1)"
            :key="a1"
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
            <v-btn-toggle v-model="type" tile color="primary accent-3" group>
              <v-btn value="buy">
                With
              </v-btn>

              <v-btn value="sell">
                For
              </v-btn>
            </v-btn-toggle>
          </div>

          <v-autocomplete
            label="Asset"
            v-model="a2"
            :items="showAll ? all : active"
            @input="$emit('a2', a2)"
          >
            <template v-slot:append>
              <v-btn @click="showAll = !showAll" class="ml-1" icon>
                <v-icon v-if="showAll">$collapse</v-icon>
                <v-icon v-else>$expand</v-icon>
              </v-btn>
            </template>
          </v-autocomplete>
          <v-textarea
            label="Asset ID"
            v-if="showAsset"
            v-model="a2"
            auto-grow
            rows="1"
          />
          <amount
            v-if="a2"
            v-model.number="v2"
            class="mb-2"
            :currency="ticker(a2)"
            :key="a2"
            :precision="precision(a2)"
          />
        </v-card-text>
      </v-card>
    </div>
    <div class="d-flex">
      <v-btn
        @click="submit"
        class="my-4 mx-auto"
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

const SATS = 100000000;

export default {
  components: { Amount },
  mixins: [Copy],

  data: () => ({
    icons,
    showAsset: false,
    type: 'buy',
    showAll: false,
    loading: false,
    a1: process.env.VUE_APP_LBTC,
    a2: process.env.VUE_APP_LCAD,
    v1: 10000,
    v2: 100000000,
  }),

  computed: {
    assets: get('assets'),
    active() {
      return [
        ...new Set([
          ...this.proposals.map(p => p.a1),
          ...this.proposals.map(p => p.a2),
        ]),
      ].map(asset => ({
        text: `${this.assets[asset].ticker} - ${this.assets[asset].name}`,
        value: asset,
      }));
    },
    all() {
      return Object.keys(this.assets)
        .map(asset => ({
          text: `${this.assets[asset].ticker} - ${this.assets[asset].name}`,
          value: asset,
        }))
        .filter(a => this.assets[a.value].ticker && this.assets[a.value].name)
        .sort((a, b) => ('' + a.text).localeCompare(b.text));
    },
    accounts() {
      return this.user.accounts
        .map(a => ({ text: a.name, value: a.asset }))
        .sort((a, b) => ('' + a.text).localeCompare(b.text));
    },

    proposals: get('proposals'),
    proposal: sync('proposal'),
    user: get('user'),
  },

  methods: {
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
      await this.createOrder({ a1, a2, v1, v2 });
      this.loading = false;
    },

    withdraw: call('withdraw'),
  },

  async mounted() {
    this.proposal = null;
  },
};
</script>
