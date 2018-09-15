<template lang="pug">
div
  h1 Network
  h2 Peers
  v-list
    template(v-for='(p, i) in peers')
      v-list-tile(:key='p.id' @click='')
        v-list-tile-content
          v-list-tile-title {{p.pub_key}}
          h2 Channels
          v-list(two-line)
            template(v-for='(c, i) in channels')
              v-list-tile(:key='c.id' @click='')
                v-list-tile-content
                  v-list-tile-action-text local
                  v-list-tile-sub-title {{c.local_balance}}
                v-list-tile-action
                  v-list-tile-title &nbsp;
                  v-list-tile-action-text remote
                  v-list-tile-sub-title {{c.remote_balance}}
                  v-layout
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  data () {
    return {
      headers: [
        { text: 'id', value: 'chan_id' },
        { text: 'local', value: 'local_balance' },
        { text: 'remote', value: 'remote_balance' },
      ],
    }
  },
  computed: {
    ...mapGetters(['channels', 'peers']),
  },
  methods: {
    ...mapActions(['getChannels', 'getPeers']),
  },
  mounted () {
    this.getChannels()
    this.getPeers()
  },
} 
</script>
