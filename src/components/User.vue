<template>
  <div>
    <receive />
    <v-btn v-if="received || invoice.address || invoice.text" @click="init" class="mr-1">
      <v-icon left>arrow_back</v-icon>
      Back
    </v-btn>
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
    invoice: sync('invoice'),
    received: get('received'),
  },
  methods: {
    clearInvoice: call('clearInvoice'),
    async init() {
      await this.clearInvoice();
      this.$set(this.invoice.user, 'username', this.username);
    },
  },
  async mounted() {
    await this.init();
  },
};
</script>
