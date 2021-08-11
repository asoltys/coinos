<template>
  <div v-if="currencies.length === 1">
    <v-btn
      class="black--text"
      :color="color(display)"
      @click="select(currencies[0])"
      >{{ display }}</v-btn
    >
    <span class="print black--text">{{ display }}</span>
  </div>
  <v-menu v-else offset-y nudge-bottom="1">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" class="black--text" :color="color(display)">
        {{ display }}</v-btn
      >
      <span class="print black--text">{{ display }}</span>
    </template>
    <v-list v-if="currencies.length">
      <v-list-item v-for="c in currencies" :key="c" @click="select(c)">
        <v-list-item-title :class="`${color(c)}--text`">{{
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
    type: { type: String },
  },

  data() {
    return {
      display: this.currency,
    };
  },

  computed: {
    user: get('user'),
  },

  methods: {
    color(c) {
      if (!this.user.currencies) return 'white';
      return ['SAT', 'KSAT', 'MSAT', 'BTC', 'GSAT', 'TSAT'].includes(c)
        ? 'white'
        : this.type === "accounts"
        ? 'liquid'
        : 'primary';
    },
    shiftAccount: call('shiftAccount'),
    setCurrency: call('setCurrency'),
    toggleFiat: call('toggleFiat'),
    setUnit: call('setUnit'),
    async select(c) {
      this.$emit('currency', c);
      this.display = c;

      let account = this.user.accounts.find(
        a => a.ticker === c && a.pubkey === this.user.account.pubkey
      );
      let currency = this.user.currencies.find(cr => cr === c);
      let btc = this.user.accounts.find(
        a =>
          a.ticker === c &&
          a.asset === BTC &&
          a.pubkey === this.user.account.pubkey
      );

      if (this.type === "accounts") {
        if (account && this.user.account.id !== account.id)
          await this.shiftAccount(account.id);
      } else if (currency) {
        return await this.setCurrency(c);
      } else if (btc && this.user.account.id !== btc.id) {
        await this.shiftAccount(btc.id);
      }

      if (!currency && this.user.fiat) await this.toggleFiat();

      if (['SAT', 'KSAT', 'MSAT', 'BTC', 'GSAT', 'TSAT'].includes(c))
        return this.setUnit(c);
    },
  },

  watch: {
    currency(v) {
      this.display = v;
    },
  },
};
</script>
