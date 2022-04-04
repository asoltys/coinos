<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <div v-else-if="exists">
      <h1 v-if="username !== 'donate'" class="text-center">
        Send to <span class="primary--text">{{ username }}</span>
      </h1>
      <div v-if="username === 'donate'" class="text-center">
        <h1>
          Thank you for supporting
          <span class="primary--text">coinos</span> development!
        </h1>
        <h3>We accept bitcoin on-chain, lightning, and liquid donations.</h3>
        <p>
          <br />
          If you would like to be recognized for your sponsorship and featured
          on our
          <a
            href="https://corporate.coinos.io/community"
            target="_blank"
            rel="noreferrer"
            >community</a
          >
          page, please include a memo with your payment. Let us know your
          Twitter, GitHub, or other website you would like your donation
          attributed to.
        </p>
      </div>
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
