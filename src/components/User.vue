<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <div v-else-if="exists">
      <h1 v-if="!invoice.text" class="text-center">
        Send a payment to <span class="yellow--text">{{ username }}</span>
      </h1>
      <receive />
      <v-btn
        v-if="received || invoice.address || invoice.text"
        @click="back"
        class="mr-1"
      >
        <v-icon left>$arrow_back</v-icon>
        Back
      </v-btn>
    </div>
    <h1 v-else class="text-center">
      User account <span class="yellow--text">{{ username }}</span> doesn't
      exist
    </h1>
  </div>
</template>

<script>
import Receive from './Receive';
import { get, call, sync } from 'vuex-pathify';

export default {
  components: { Receive },
  data: () => ({
    exists: false,
    loading: true,
  }),
  props: {
    username: { type: String, default: '' },
  },
  computed: {
    invoice: sync('invoice'),
    received: get('received'),
  },
  methods: {
    checkUser: call('checkUser'),
    clearInvoice: call('clearInvoice'),
    async back() {
      await this.clearInvoice();
      this.$nextTick(() => {
        this.$set(this.invoice.user, 'username', this.username);
      });
    },
  },
  async mounted() {
    this.exists = await this.checkUser(this.username);
    this.loading = false;
    this.$nextTick(() => {
      this.$set(this.invoice.user, 'username', this.username);
    });
  },
};
</script>
