<template>
  <div v-if="user.id" class="text-center">
    <balance />
    <payments class="mb-2" />
    <div class="mb-4 d-flex flex-wrap">
    <v-btn-toggle tile color="primary accent-3" group class="flex-wrap mx-auto">
      <v-btn class="flex-grow-1 mr-1 mb-1 mb-md-0 wide" @click="$go('/receive')">
        <v-icon left color="green">$download</v-icon><span>Receive a Payment</span>
      </v-btn>
      <v-btn class="flex-grow-1 mr-1 mb-1 mb-md-0 wide" @click="$go('/settings')">
        <v-icon left color="primary">$settings</v-icon><span>Setup Account</span>
      </v-btn>
      <v-btn class="flex-grow-1 mr-1 mb-1 mb-md-0 wide" @click="$go('/about')">
        <v-icon left color="blue lighten-2">$help</v-icon><span>About Coinos</span>
      </v-btn>
      <v-btn class="flex-grow-1 mr-1 wide" @click="$go('/logout')">
        <v-icon left color="pink">$power</v-icon><span>Sign Out</span>
      </v-btn>
      </v-btn-toggle>
    </div>
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
