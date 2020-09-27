<template>
  <v-card v-if="proposals.length">
    <v-card-text class="white--text">
      <h2>Open Orders</h2>
      <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
      <v-container class="pb-0 text-right">
        <v-row>
          <v-col>Send</v-col>
          <v-col>Receive</v-col>
          <v-btn icon class="toggle" style="visibility: hidden; height: 0;">
            <v-icon color="error">$cancel</v-icon>
          </v-btn>
        </v-row>
        <v-row v-for="p in proposals" :key="p.id">
          <v-col class="my-auto">
            <span>{{ format(p.a1, p.v1) }}</span>
            <span class="yellow--text">{{ format(p.a1) }}</span>
          </v-col>
          <v-col class="my-auto">
            <span>{{ format(p.a2, p.v2) }}</span>
            <span class="yellow--text">{{ format(p.a2) }}</span>
          </v-col>
          <v-btn
            v-if="p.user_id === user.id"
            @click.stop="deleteProposal(p.id)"
            class="my-auto toggle"
            icon
          >
            <v-icon color="error">$cancel</v-icon>
          </v-btn>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import { get, sync, call } from 'vuex-pathify';
import Copy from '../mixins/Copy';

export default {
  props: {
    proposals: {
      type: Array,
      default: () => [],
    },
  },
  mixins: [Copy],
  data() {
    return {
      accepting: false,
    };
  },
  computed: {
    assets: get('assets'),
    loading: get('loading'),
    user: get('user'),
  },
  methods: {
    getAssets: call('getAssets'),
    accept: call('accept'),
    deleteProposal: call('deleteProposal'),
    download(text) {
      const filename = 'proposal.txt';
      const blob = new Blob([text], {
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
    format(asset, value) {
      let precision = 0,
        ticker;
      let obj = this.assets[asset];
      if (obj) ({ precision, ticker } = obj);
      if (value)
        return parseFloat(this.$format(value, precision)).toFixed(precision);
      if (ticker) return ticker;
      return asset.substr(0, 3);
    },
  },

  async mounted() {
    await this.getAssets();
  },
};
</script>

<style lang="stylus">
.bg
  position absolute
  right -4px
  top -4px
  height 30px
  opacity 0.4

.ask
  background #b71c1c

.bid
  background #4CAF50

.col
  padding 0

.hover
  &:hover
    background #333
</style>
