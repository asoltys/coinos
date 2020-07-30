<template>
  <div v-if="currencies.length === 1">
    <v-btn
      class="black--text"
      :color="color(currency)"
      @click="select(currencies[0])"
      >{{ display }}</v-btn
    >
    <span class="print black--text">{{ display }}</span>
  </div>
  <v-menu v-else offset-y nudge-bottom="1">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" class="black--text" :color="color(display)">{{
        display
        }}</v-btn>
      <span class="print black--text">{{ display }}</span>
    </template>
    <v-list v-if="currencies.length">
      <v-list-item v-for="c in currencies" :key="c" @click="select(c)">
        <v-list-item-title :style="{ color: color(c) }">{{
          c
        }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { get, call } from 'vuex-pathify';
const BTC = process.env.VUE_APP_LBTC;

export default {
  props: {
    currency: { type: String },
    currencies: { type: Array },
  },

  data() {
    return {
      display: this.currency,
    };
  },

  computed: {
    assets: get('assets'),
    user: get('user'),
  },

  methods: {
    color(c) {
      return ['BTC', 'SAT'].includes(c)
        ? 'white'
        : this.user.currencies.includes(c)
        ? 'yellow'
        : '#0ae';
    },
    shiftAccount: call('shiftAccount'),
    setCurrency: call('setCurrency'),
    toggleUnit: call('toggleUnit'),
    async select(c) {
      this.display = c;

      let account = this.user.accounts.find(a => a.ticker === c);
      let currency = this.user.currencies.find(cr => cr === c);

      if (account) {
        await this.shiftAccount(account.asset);
      } else if (currency) {
        await this.setCurrency(c);
      } else {
        await this.shiftAccount(BTC);
      } 

      if (c === 'SAT' && this.user.unit !== 'SAT') await this.toggleUnit();
      if (c !== 'SAT' && this.user.unit !== 'BTC') await this.toggleUnit();

      this.$emit('currency', c);
    },
  },

  watch: {
    currency(v) {
      this.display = v;
    },
  },
};
</script>
