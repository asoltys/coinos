<template>
  <div v-if="user.username" class="text-center">
    <balance />
    <payments />
    <div
      v-if="user.account.ticker === 'BTC' && user.account.balance < 101"
      class="mx-auto mt-4"
    >
      <div class="headline mb-2">Welcome! Your account is empty</div>
      <v-btn class="mb-2 mr-1 wide" @click="$router.push('/receive')">
        <v-icon class="mr-1">get_app</v-icon><span>Receive Funds</span>
      </v-btn>
    </div>
    <v-btn
      v-if="user.username.startsWith('Guest')"
      class="mb-2 mr-1 wide"
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

  computed: mapGetters(['rate', 'user']),
  methods: mapActions(['snack']),
};
</script>
