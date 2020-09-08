<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <v-expansion-panels v-else accordion class="mb-2">
      <v-expansion-panel v-for="p in proposals" :key="p.id">
        <v-expansion-panel-header
          ripple
          class="d-flex justify-between"
          expand-icon=""
        >
          <div class="title d-flex flex-wrap justify-around flex-grow-1">
            <div class="d-flex no-wrap mr-1">
              <div>
                {{ format(p.a1, p.v1) }}
              </div>
              <v-btn class="toggle ml-1" color="yellow">{{
                format(p.a1)
              }}</v-btn>
            </div>
            <div class="flex-shrink-1 body-1 my-auto text-center mr-1">for</div>
            <div class="flex-grow-1 d-flex no-wrap">
              <div>
                {{ format(p.a2, p.v2) }}
              </div>
              <v-btn class="toggle ml-1" color="yellow">{{
                format(p.a2)
              }}</v-btn>
            </div>
          </div>
          <div class="d-flex flex-grow-1 flex-nowrap text-right ml-auto">
            <v-btn class="mr-1 ml-auto" @click.stop="download(p.text)" icon>
              <v-icon>$download</v-icon>
            </v-btn>
            <v-btn class="mr-1" @click.stop="copy(p.text)" icon>
              <v-icon>$copy</v-icon>
            </v-btn>
            <span v-if="user.id">
              <v-btn
                v-if="p.user_id === user.id"
                @click.stop="deleteProposal(p.id)"
              >
                <v-icon left>$delete</v-icon>
                Delete
              </v-btn>
              <v-btn v-else @click.stop="accept({ id: p.id })" color="green">
                <v-icon class="d-none d-sm-inline-flex" left>$send</v-icon>
                <v-icon class="d-sm-none">$send</v-icon>
                <span class="d-none d-sm-inline">Accept</span>
              </v-btn>
            </span>
            <v-btn
              v-else
              @click.stop="
                $router.push({ name: 'accept', params: { id: p.id } })
              "
              color="green"
            >
              <v-icon left>$send</v-icon>
              Accept
            </v-btn>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="text-left">
          <v-textarea
            label="Proposer Sends"
            :value="p.a1"
            rows="1"
            auto-grow
            readonly
          >
            <template v-slot:append>
              <v-btn @click="() => copy(p.a1)" icon class="ml-1">
                <v-icon>$copy</v-icon>
              </v-btn>
            </template>
          </v-textarea>
          <v-textarea
            label="Acceptor Sends"
            :value="p.a2"
            rows="1"
            auto-grow
            readonly
          >
            <template v-slot:append>
              <v-btn @click="() => copy(p.a1)" icon class="ml-1">
                <v-icon>$copy</v-icon>
              </v-btn>
            </template>
          </v-textarea>
          <acceptance v-if="accepting" />
          <v-textarea
            label="Base64 Encoded Transaction Proposal"
            v-else
            :value="p.text"
            rows="10"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
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

<style lang="stylus" scoped>
.toggle
  color black
  max-height 2em
  min-width 44px !important
</style>
