<template>
  <v-card v-if="proposals.length">
    <v-card-text class="white--text">
      <h2>Open Orders</h2>
      <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
      <v-container class="pb-0">
        <v-row v-for="p in proposals" :key="p.id">
          <div class="my-auto">
          <span class="mx-1">{{ format(p.a1, p.v1) }}</span>
          <span class="yellow--text">{{ format(p.a1) }}</span>
          <span class="mx-1">{{ format(p.a2, p.v2) }}</span>
          <span class="yellow--text">{{ format(p.a2) }}</span>
          </div>
          <v-col class="text-right">
            <v-btn
              v-if="p.user_id === user.id"
              @click.stop="deleteProposal(p.id)"
              class="my-1 d-sm-none"
              icon
            >
              <v-icon color="error">$cancel</v-icon>
            </v-btn>
            <v-btn
              v-if="p.user_id === user.id"
              @click.stop="deleteProposal(p.id)"
              class="toggle my-1 d-none d-sm-inline"
            >
              <v-icon color="error" left>$cancel</v-icon>
              Cancel
            </v-btn>
          </v-col>
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
