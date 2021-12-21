<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <div v-else-if="faucet">
      <balance />
      <v-card class="elevation-1 mb-4 pa-4">
        <v-card-text class="white--text text-center">
          <div class="headline mb-2">
            Faucet for
            <span class="primary--text">{{ ticker }}</span>
          </div>
          <div class="d-flex">
            <div
              class="display-2 font-weight-black flex-grow-1 text-right mr-2"
            >
              {{ $format(faucet.balance, precision) }}
            </div>
            <div class="text-left flex-grow-1 my-auto">
              <currency-list :currency="'BTC'" :currencies="['SAT', 'BTC']" />
            </div>
          </div>
          <amount
            v-model.number="payment.amount"
            class="mb-2"
            @done="$emit('feeRate')"
            :currency="currency"
          />
          <div>
            <v-btn
              class="order-first order-sm-last mb-2 flex-grow-1"
              dark
              @click="loadFaucet(asset)"
            >
              <v-icon left color="green">$send</v-icon><span>Send</span>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
import { call, get } from 'vuex-pathify';
import Amount from './Amount';
import Balance from './Balance';
import CurrencyList from './CurrencyList';

export default {
  props: {
    asset: { type: String, default: '' },
  },
  data: () => ({
    loading: false,
    faucet: null,
  }),
  components: { Amount, Balance, CurrencyList },
  computed: {
    precision() {
      if (this.user.unit === 'SAT') return 0;
      else if (this.user.unit === 'KSAT') return 3;
      else if (this.user.unit === 'MSAT') return 6;
      else return this.faucet.precision;
    },
    assets: get('assets'),
    ticker() {
      let asset = this.assets[this.asset];
      if (asset) return asset.ticker;
      else return '';
    },
    currency() {
      if (this.user.account.ticker === 'BTC') return null;
      else return this.user.account.ticker;
    },
    payment: get('payment'),
    user: get('user'),
  },
  methods: {
    getFaucet: call('getFaucet'),
    loadFaucet: call('loadFaucet'),
    clearPayment: call('clearPayment'),
  },
  async mounted() {
    this.clearPayment();
    this.loading = true;
    this.faucet = await this.getFaucet(this.asset);
    this.loading = false;
  },
};
</script>
