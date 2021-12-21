<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <div v-else-if="exists">
      <h1 class="text-center">
        Send to <span class="primary--text">{{ username }}</span>
      </h1>
      <receive />
    </div>
    <h1 v-else class="text-center">
      User account <span class="primary--text">{{ username }}</span> doesn't
      exist
    </h1>
  </div>
</template>

<script>
import Receive from './Receive';
import { get, call, sync } from 'vuex-pathify';

export default {
  components: { Receive },
  head() {
    return {
      title: this.username,
      titleTemplate: 'coinos - %s',
      meta: [
        {
          name: 'lightning',
          content: this.username,
          template: 'lnurlp:%s@coinos.io',
        },
      ],
    };
  },
  data: () => ({
    exists: false,
    loading: true,
  }),
  props: {
    username: { type: String, default: '' },
  },
  computed: {
    rate: get('rate'),
    rates: get('rates'),
    invoice: sync('invoice'),
    received: get('received'),
    recipient: sync('recipient'),
    user: get('user'),
  },
  methods: {
    setCurrency: call('setCurrency'),
    updateAmount(amount, fiatAmount, currency) {
      this.setCurrency(currency);
      this.$nextTick(() => {
        this.invoice.amount = amount;
        this.invoice.fiatAmount = fiatAmount;
      });
    },
    addInvoice: call('addInvoice'),
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
    this.recipient.username = this.username;
    this.recipient.account.pubkey = null;
    this.exists = await this.checkUser(this.username);
    const waitForRates = (resolve) => {
      if (!this.rates)
        return (this.timeout = setTimeout(() => waitForRates(resolve), 1000));
      resolve();
    };
    await new Promise(waitForRates);
    if (this.exists) this.addInvoice();
    this.loading = false;
  },

  beforeDestroy() {
    this.recipient.username = null;
  },
};
</script>
