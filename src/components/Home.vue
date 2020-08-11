<template>
  <div v-if="user.username" class="text-center">
    <balance />
    <div
      v-if="user.account.ticker === 'BTC' && !(user.account.balance || user.account.pending)"
      class="mx-auto mb-2"
    >
      <div class="headline mb-2">Welcome! Your account is empty</div>
      <v-btn class="mr-1 wide" @click="$router.push('/receive')">
        <v-icon left>$download</v-icon><span>Receive Funds</span>
      </v-btn>
    </div>
    <payments class="mb-2" />
    <v-btn
      v-if="!user.password"
      class="mr-1 wide"
      @click="$router.push('/settings')"
    >
      <v-icon left color="yellow">$alert</v-icon><span>Setup Account</span>
    </v-btn>
  </div>
</template>

<script>
import Balance from './Balance';
import Payments from './Payments';
import { get, call, sync } from 'vuex-pathify';

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

  data() {
    return {
      status: 'Notification Status Unknown',
    };
  },

  computed: {
    initializing: sync('initializing'),
    loading: sync('loading'),
    rate: get('rate'),
    user: get('user'),
  },

  methods: {
    snack: call('snack'),
  },
};
</script>
