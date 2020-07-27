<template>
  <div>
    <h2>Proposals</h2>

    <v-progress-linear v-if="loading" indeterminate />
    <proposals v-else-if="pending.length" :proposals="pending" />
    <v-alert v-else color="primary" class="black--text" transition="scale-transition"
      >No pending proposals found</v-alert
    >

    <div v-if="own.length">
      <h2>Your Proposals</h2>
      <proposals :proposals="own" />
    </div>

    <v-btn @click="$go('/')" class="wide mb-2 mr-2">
      <v-icon>arrow_back</v-icon>
      Back
    </v-btn>
    <v-btn
      v-if="user.id"
      class="mx-auto mb-2 wide"
      @click="$go('/propose')"
    >
      <v-icon>add</v-icon>
      <span>New</span>
    </v-btn>
  </div>
</template>

<script>
import { get, sync, call } from 'vuex-pathify';
import Proposals from './Proposals';

export default {
  components: { Proposals },
  computed: {
    loading: get('loading'),
    own() {
      if (!this.user.id) return [];
      return this.proposals.filter(p => !p.accepted && p.user_id === this.user.id);
    },
    pending() {
      return this.proposals.filter(p => !p.accepted && (typeof p.user_id === 'undefined' || p.user_id !== this.user.id));
    },
    proposals: sync('proposals'),
    user: get('user'),
  },
  methods: {
    getProposals: call('getProposals'),
  },
  async mounted() {
    await this.getProposals();
  },
};
</script>
