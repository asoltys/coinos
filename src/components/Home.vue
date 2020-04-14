<template>
  <div v-if="user.username" class="text-center">
    <balance />
    <payments />
    <div v-if="user.balance <= 100" class="mx-auto mt-4">
      <v-btn class="mb-2 mr-1 wide" @click="$router.push('/receive')">
        <v-icon class="mr-1">get_app</v-icon><span>Receive Funds</span>
      </v-btn>
    </div>
    <div
      v-if="user.balance > 0 && user.username.startsWith('Guest')"
      class="mx-auto mt-2"
    >
      <v-btn class="mb-2 mr-1 wide" @click="$router.push('/settings')">
        <v-icon class="mr-1 yellow--text">warning</v-icon
        ><span>Setup Account</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Balance from './Balance';
import Payments from './Payments';

export default {
  components: { Balance, Payments },
  props: {
    username: {
      type: String,
      default: '',
    },
    email: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      default: '',
    },
  },

  computed: mapGetters(['rate', 'user']),
  methods: mapActions(['snack']),

  created() {
    if (this.email) {
      this.$store.dispatch('verifyEmail', {
        username: this.username,
        token: this.token,
      });
    }

    if (this.phone) {
      this.$store.dispatch('verifyPhone', {
        username: this.username,
        token: this.token,
      });
    }
  },
};
</script>

<style lang="stylus" scoped>
code
  max-width 100%
  word-wrap break-word
  font-size 0.9em

.v-chip
  padding 5px
  width 100%
  margin 0

.container.no-padding
  padding 0 !important

.arrows .v-btn
  margin 0
  margin-top 8px
  width 100%

.arrow
  margin 8px 0
</style>
