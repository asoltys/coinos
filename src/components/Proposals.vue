<template>
  <v-expansion-panels accordion class="mb-2">
    <v-expansion-panel v-for="p in proposals" :key="p.id">
      <v-expansion-panel-header ripple class="d-flex" expand-icon="">
        <div class="title">
          {{ p.v1 }}
          <v-btn class="toggle ml-1" color="yellow">{{ format(p.a1) }}</v-btn>
          <span class="body-1"> for </span>
          {{ p.v2 }}
          <v-btn class="toggle ml-1" color="yellow">{{ format(p.a2) }}</v-btn>
        </div>
        <v-spacer />
        <div class="text-right">
          <v-btn class="mr-1" @click.stop="download(p.text)" icon>
            <v-icon>get_app</v-icon>
          </v-btn>
          <v-btn class="mr-1" @click.stop="copy(p.text)" icon>
            <v-icon>content_copy</v-icon>
          </v-btn>
          <span v-if="user.id">
            <v-btn
              v-if="p.user_id === user.id"
              @click.stop="deleteProposal(p.id)"
            >
              <v-icon left>delete</v-icon>
              Delete
            </v-btn>
            <v-btn v-else @click.stop="accept(p.id)" color="green">
              <v-icon left>send</v-icon>
              Accept
            </v-btn>
          </span>
          <v-btn
            v-else
            @click.stop="$router.push({ name: 'accept', params: { id: p.id } })"
            color="green"
          >
            <v-icon left>send</v-icon>
            Accept
          </v-btn>
        </div>
      </v-expansion-panel-header>
      <v-expansion-panel-content class="text-left">
        <acceptance v-if="accepting" />
        <v-textarea v-else :value="p.text" rows="10" />
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
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
    user: get('user'),
  },
  methods: {
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
    format(asset) {
      if (this.assets[asset]) return this.assets[asset].ticker;
      else return asset.substr(0, 3);
    },
  },
};
</script>

<style lang="stylus" scoped>
.toggle
  color black
  max-height 24px
  margin-bottom 2px
  min-width 44px !important
  width 44px !important
</style>
