<template>
  <div>
    <receive />
  </div>
</template>

<script>
import Receive from './Receive';
import { get, call, sync } from 'vuex-pathify';

export default {
  components: { Receive },
  props: {
    username: { type: String, default: '' },
  },
  computed: {
    user: get('user'),
  },
  async mounted() {
    this.user.username = this.username;
  },
};
</script>
