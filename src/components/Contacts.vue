<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <v-list v-else-if="friends.length">
      <template v-for="(friend, i) in [...friends].sort((a, b) => a.name.localeCompare(b.name))">
        <v-list-item @click="send(friend)" :key="i">
          <v-list-item-content>
            <div class="d-flex">
              <v-avatar class="mr-2" size="40">
                <img :src="friend.pic" />
              </v-avatar>
              <div class="mr-auto my-auto">
                {{ friend.name }}
              </div>
            </div>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn class="pay px-2" @click="send(friend)">Send</v-btn>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list>
    <v-alert class="black--text" v-else color="yellow"
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
