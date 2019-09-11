<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <v-list v-else-if="friends.length">
      <template v-for="(friend, i) in friends">
        <v-list-tile @click="send(friend)" :key="i">
          <v-list-tile-content>
            <v-layout>
              <v-flex class="my-auto">
                <v-avatar class="mr-2" size="40"
                  ><img :src="friend.pic"
                /></v-avatar>
              </v-flex>
              <v-flex class="my-auto">
                <v-list-tile-title
                  ><span>{{ friend.name }}</span></v-list-tile-title
                >
              </v-flex>
            </v-layout>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn class="pay px-2" @click="send(friend)">Send</v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </template>
    </v-list>
    <v-alert class="black--text" value="true" v-else color="yellow"
      ><span>None of your friends are using CoinOS</span></v-alert
    >
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  computed: mapGetters(['friends', 'loading']),
  methods: {
    ...mapActions(['getFriends']),

    send(friend) {
      this.$router.push({ path: '/send', query: { payuser: friend.id } });
    },
  },

  mounted() {
    this.getFriends();
  },
};
</script>

<style lang="stylus" scoped>
.pay
  min-width 0

.sent
  color rgb(255, 185, 85) !important

.received
 color rgb(180, 255, 0) !important

.fullwidth
  width 100%

.date-picker .v-btn
  width 100%
</style>
