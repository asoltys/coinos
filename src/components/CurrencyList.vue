<template>
  <v-menu v-if="user && user.name" offset-y nudge-bottom="1">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" class="black--text" :color="color(currency)">{{
        currency
      }}</v-btn>
    </template>
    <v-list v-if="currencies.length">
      <v-list-item v-for="c in currencies" :key="c" @click="() => select(c)">
        <v-list-item-title :class="`${color(c)}--text`">{{ c }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { get, call } from 'vuex-pathify';
export default {
  props: {
    currency: { type: String },
    currencies: { type: Array },
  },

  computed: {
    user: get('user'),
  },

  methods: {
    color(c) {
      let tickers = this.user.accounts.map(a => a.ticker);
      return ['SAT', 'BTC', ...tickers].includes(c) ? 'white' : 'yellow';
    },
    shiftAccount: call('shiftAccount'),
    setCurrency: call('setCurrency'),
    toggleUnit: call('toggleUnit'),
    async select(c) {
      let account = this.user.accounts.find(a => a.ticker === c);
      let currency = this.user.currencies.find(cr => cr === c);

      if (account) {
        await this.shiftAccount(account.asset);
      } else if (currency || c === 'SAT') {
        await this.shiftAccount(process.env.VUE_APP_LBTC);
        await this.setCurrency(c);
      }

      if (['BTC', 'SAT'].includes(c) && this.user.unit !== c)
        await this.toggleUnit();

      this.$emit('currency', c);
    },
  },
};
</script>
