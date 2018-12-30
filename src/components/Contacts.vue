<template lang="pug">
  div
    v-progress-linear(v-if='loading' indeterminate)
    v-list(v-else-if='friends.length')
      template(v-for='(friend, i) in friends')
        v-list-tile
          v-list-tile-content
            v-layout
              v-flex.my-auto
                v-avatar(size='40').mr-2
                  img(:src='friend.pic')
              v-flex.my-auto
                v-list-tile-title
                  span {{friend.name}}
          v-list-tile-action
            v-btn.px-2(@click='$router.push({ path: "/send", query: { to: friend.id } })') Send Payment
    v-alert(value='true' v-else color='yellow').black--text None of your friends are using CoinOS
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  computed: mapGetters(['friends', 'loading']),
  methods: mapActions(['getFriends']),

  mounted () {
    this.getFriends()
  },
}
</script>

<style lang="stylus" scoped>
.sent
  color rgb(255, 185, 85) !important

.received
 color rgb(180, 255, 0) !important

.fullwidth
  width 100%

.date-picker .v-btn
  width 100%
</style>
