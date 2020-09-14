<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <div v-else-if="exists">
      <h1 class="text-center">
        Send to <span class="yellow--text">{{ username }}</span>
      </h1>
      <request v-if="invoice.text" />
      <div v-else>
      <numpad
        @done="addInvoice()"
        :currencies="['SAT', 'BTC', ...user.currencies]"
        :initialAmount="0"
        :initialRate="rate"
              @input="updateAmount"
      />
      <div class="d-flex flex-wrap buttons">
        <v-btn class="flex-grow-1 mb-1" @click="addInvoice()">
          <v-icon left color="primary">$send</v-icon>
          Go
        </v-btn>
      </div>
      </div>
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
import Numpad from './NumPad';
import Request from './Request';
import { get, call, sync } from 'vuex-pathify';

export default {
  components: { Numpad, Request },
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
    this.$set(this.user, 'username', this.username);
    this.exists = await this.checkUser(this.username);
    const waitForRates = resolve => {
      if (!this.rates)
        return this.timeout = setTimeout(() => waitForRates(resolve), 1000);
      resolve();
    };
    await new Promise(waitForRates);
    this.loading = false;
  },
};
</script>
