<template>
  <v-card class="elevation-1 pa-2 my-4 text-center" v-if="payuser">
    <v-layout wrap>
      <v-flex>
        <div class="body-1 gray--text">Send To</div>
      </v-flex>
      <v-flex v-if="friend" xs12>
        <v-avatar><img :src="friend.pic"/></v-avatar
        ><span class="subheading ml-2">{{ friend.name }}</span>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
export default {
  props: { payuser: { type: String } },

  computed: {
    friend() {
      return this.friends.find(f => f.id === this.payuser);
    },
  },
};
</script>
