<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <template v-else>
      <Balance />
      <sent v-if="payment.sent" />
      <recipient v-else-if="payment.recipient" @internal="sendInternal" />
      <template v-else>
        <to v-if="!(payment.payobj || payment.address)" @edit="edit" :text="text" />
        <lightning-payment v-else-if="payment.payobj && !editing" @edit="edit" />
        <payment-details v-else @edit="edit" />
      </template>
    </template>
  </div>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';

import Balance from './Balance';
import LightningPayment from './LightningPayment';
import PaymentDetails from './PaymentDetails';
import Recipient from './Recipient';
import Sent from './Sent';
import To from './To';

export default {
  components: {
    Balance,
    LightningPayment,
    Recipient,
    PaymentDetails,
    Sent,
    To,
  },

  props: {
    keep: {
      type: Boolean,
      default: false,
    },
    text: { type: String, default: '' }
  },

  data() {
    return {
      currency: '',
      editing: false,
    };
  },

  computed: {
    loading: get('loading'),
    payment: get('payment'),
    user: get('user'),
  },

  methods: {
    clearPayment: call('clearPayment'),
    estimateFee: call('estimateFee'),
    sendInternal: call('sendInternal'),
    setCurrency: call('setCurrency'),

    edit() { this.editing = true; },

    done() {
      this.editing = false;
      this.estimateFee();
      this.setCurrency(this.currency);
    },

    init() {
      if (!this.keep) this.clearPayment();
      if (this.$route.query.refresh !== undefined) {
        this.$router.replace(this.$route.path);
      }
    },
  },

  beforeRouteUpdate(to, from, next) {
    next();
    this.init();
  },

  mounted() {
    this.init();
  },
};
</script>

<style lang="stylus" scoped>
@media (max-width: 600px)
  .v-btn
    width 100%
    height 62px !important
</style>
