<template>
  <v-card class="mb-2">
    <v-card-title class="pb-0">Server Funds</v-card-title>
    <v-progress-linear v-if="loading" indeterminate />
    <v-card-text v-else-if="balances" class="white--text">
      <v-list>
        <v-list-item v-if="nodes.includes('bitcoin')">
          <v-list-item-avatar>
            <img class="ml-2" src="../assets/bitcoin.png" style="width: 25px; height: 25px" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>Bitcoin</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action class="title">
            {{ balances.bitcoin }}
          </v-list-item-action>
        </v-list-item>
        <v-list-item v-if="nodes.includes('liquid')">
          <v-list-item-avatar>
            <water class="ml-2"  fillColor="#00aaee" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>Liquid</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action class="title">
            {{ balances.liquid }}
          </v-list-item-action>
        </v-list-item>
        <v-list-item v-if="nodes.includes('lightning')">
          <v-list-item-avatar>
            <flash class="ml-2" fillColor="yellow" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>Lightning</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action class="title">
            {{ balances.lnchannel }}
          </v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon class="ml-0 pl-0" color="green">$account</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>User Balances</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action class="title">
            {{ custodial }}
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import { get, call } from 'vuex-pathify';
import Flash from 'vue-material-design-icons/Flash';
import Water from 'vue-material-design-icons/Water';

export default {
  components: { Flash, Water },

  data() {
    return {
      expanded: false,
    };
  },
  computed: {
    assets() {
      let assets = Object.keys(this.balances.assets);
      assets.shift();
      return assets;
    },
    custodial() {
      return this.balances.accounts.find(a => a.asset === process.env.VUE_APP_LBTC && !a.pubkey).total;
    },
    noncustodial() {
      return this.balances.accounts.find(a => a.asset === process.env.VUE_APP_LBTC && a.pubkey).total;
    },
    loading: get('loading'),
    nodes: get('nodes'),
    balances: get('balances'),
  },
  methods: {
    getBalances: call('getBalances'),
  },
  mounted() {
    this.getBalances();
  },
};
</script>

<style lang="stylus" scoped>
span
 max-width 80%

.wrap
  max-width 100%
  word-wrap break-word

.col-3
  padding-top 0 !important
  padding-bottom 0 !important
</style>
