<template lang="pug">
div
  h1 Network
  h2 Peers
  pre {{peers}}
  v-list
    template(v-for='(p, i) in peers')
      h3 {{p.pub_key}}
      template(v-for='(c, i) in channels.filter(c => c.remote_pubkey === p.pub_key)')
        div
          span {{c.local_balance}} {{c.remote_balance}}
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  data() {
    return {
      headers: [
        { text: 'id', value: 'chan_id' },
        { text: 'local', value: 'local_balance' },
        { text: 'remote', value: 'remote_balance' },
      ],
    };
  },
  computed: {
    ...mapGetters(['channels', 'peers']),
  },
  methods: {
    ...mapActions(['getChannels', 'getPeers']),
  },
  mounted() {
    this.getChannels();
    this.getPeers();
  },
};
</script>
