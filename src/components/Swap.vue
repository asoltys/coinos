<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <div>
      <div class="d-flex flex-wrap flex-md-nowrap">
        <v-card class="flex-grow-1 mr-md-2 mb-2">
          <v-card-text>
            <h2 class="text-center white--text">Trade</h2>
            <v-autocomplete label="Select" v-model="a1" :items="accounts" @input="$emit('a1', a1)" />
            <amount
              v-if="a1"
              v-model.number="v1"
              class="mb-2"
              :currency="ticker(a1)"
              :key="a1"
            />
          </v-card-text>
        </v-card>
        <v-card class="flex-grow-1 mb-2">
          <v-card-text>
            <h2 class="text-center white--text">For</h2>
            <v-autocomplete label="Select" v-model="a2" :items="all" @input="$emit('a2', a2)" />
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
      <div class="d-flex mb-2">
        <v-btn @click="submit" class="flex-grow-1 wide">
          <v-icon left color="primary">$send</v-icon><span>Place Order</span>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import Amount from './Amount';
import { get, call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';

const SATS = 100000000;

export default {
  components: { Amount },
  mixins: [Copy],

  data() {
    return {
      loading: false,
      showcode: false,
      a1: process.env.VUE_APP_LBTC,
      a2: process.env.VUE_APP_LCAD,
      v1: 1000,
      v2: 100000000,
    };
  },

  computed: {
    assets: get('assets'),
    all() {
      return Object.keys(this.assets)
        .map(asset => ({
          text: `${this.assets[asset].ticker} - ${this.assets[asset].name}`,
          value: asset,
        }))
        .sort((a, b) => ('' + a.text).localeCompare(b.text));
    },
    accounts() {
      return this.user.accounts
        .map(a => ({ text: a.name, value: a.asset }))
        .sort((a, b) => ('' + a.text).localeCompare(b.text));
    },

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
    publish: call('publish'),
    download() {
      const filename = 'proposal.txt';
      const blob = new Blob([this.proposal.text], {
        type: 'text/plain;charset=utf-8;',
      });
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
      } else {
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    },

    propose: call('propose'),

    async submit() {
      const { a1, a2, v1, v2 } = this;
      await this.propose({ a1, a2, v1, v2 });
    },

    withdraw: call('withdraw'),
  },

  async mounted() {
    this.loading = true;
    this.loading = false;
    this.proposal = null;
  },
};
</script>
