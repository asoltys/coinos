<template>
  <div v-if="user.username" class="text-center">
    <balance />
    <div
      v-if="user.account.ticker === 'BTC' && !user.account.balance"
      class="mx-auto mb-2"
    >
      <div class="headline mb-2">Welcome! Your account is empty</div>
      <v-btn class="mr-1 wide" @click="$router.push('/receive')">
        <v-icon class="mr-1">get_app</v-icon><span>Receive Funds</span>
      </v-btn>
    </div>
    <payments class="mb-2" />
    <v-btn
      v-if="user.username.startsWith('Guest')"
      class="mr-1 wide"
      @click="$router.push('/settings')"
    >
      <v-icon class="mr-1 green--text">person</v-icon><span>Setup Account</span>
    </v-btn>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Balance from './Balance';
import Payments from './Payments';
import { sync } from 'vuex-pathify';

export default {
  components: { Balance, Payments },
  props: {
    username: {
      type: String,
      default: '',
    },
    token: {
      type: String,
      default: '',
    },
  },

  computed: {
    ...mapGetters(['rate', 'user']),
    initializing: sync('initializing'),
    loading: sync('loading'),
  },

  methods: mapActions(['snack']),
};
</script>
