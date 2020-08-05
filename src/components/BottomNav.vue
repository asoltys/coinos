<template>
  <div id="footer">
    <v-bottom-navigation
      class="d-flex justify-space-around text-center"
      height="60"
      background-color="#212121"
      dark
    >
      <v-btn class="flex-grow-1" text @click="home">
        <span>Payments</span>
        <v-icon>$payments</v-icon>
      </v-btn>
      <v-btn class="flex-grow-1" text @click="$go('/receive?refresh')">
        <span>Receive</span>
        <v-icon>$download</v-icon>
      </v-btn>
      <v-btn class="flex-grow-1" text @click="$go('/scan')">
        <span>Scan</span>
        <v-icon>$camera</v-icon>
      </v-btn>
      <v-btn
        class="flex-grow-1"
        v-if="user"
        text
        @click="$go('/send?refresh')"
      >
        <span>Send</span>
        <send />
      </v-btn>
      <v-btn class="flex-grow-1" text @click="$go('/settings')">
        <span>Settings</span>
        <v-icon>$settings</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script>
import Send from 'vue-material-design-icons/Send';
import { mapActions, mapGetters } from 'vuex';

export default {
  components: { Send },

  computed: mapGetters(['user']),

  methods: {
    home() {
      this.$go('/home');
      window.scrollTo(0, 0);
    },

    ...mapActions(['scan']),
  },
};
</script>

<style lang="stylus">
#footer {
 position: fixed; bottom: 0; padding: 0; width: 100%; z-index: 1;
}

.v-bottom-navigation .v-btn
  height 60px !important
</style>
