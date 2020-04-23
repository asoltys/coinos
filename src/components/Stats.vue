<template>
  <v-card>
    <v-card-title class="pb-0">Server Funds</v-card-title>
    <v-progress-linear v-if="loading" indeterminate />
    <v-card-text v-else-if="stats" class="white--text">
      <v-list>
        <v-list-item>
          <v-list-item-avatar>
            <img class="ml-2" src="../assets/bitcoin.png" style="width: 25px; height: 25px" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>Bitcoin</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action class="title">
            {{ stats.bitcoin }}
          </v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-avatar>
            <water class="ml-2"  fillColor="#00aaee" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>Liquid</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action class="title">
            {{ stats.liquid }}
          </v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-avatar>
            <flash class="ml-2" fillColor="yellow" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>Lightning</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action class="title">
            {{ stats.lnchannel }}
          </v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon class="ml-0 pl-0" color="green">person</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>User Balances</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action class="title">
            {{ stats.user }}
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
      let assets = Object.keys(this.stats.assets);
      assets.shift();
      return assets;
    },
    loading: get('loading'),
    stats: get('stats'),
  },
  methods: {
    getStats: call('getStats'),
  },
  mounted() {
    this.getStats();
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
