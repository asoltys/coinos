<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <template v-else>
      <Balance />
      <sent v-if="payment.sent" />
      <template v-else>
        <lightning-payment v-if="payment.payobj && !editing" @edit="edit" />
        <to v-if="!(payment.payobj || payment.address || payment.recipient)" @edit="edit" />
        <amount v-else-if="editing" @edit="edit" @done="done" />
        <payment-details v-else @edit="edit" />
      </template>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { sync } from 'vuex-pathify';

import Amount from './Amount';
import Balance from './Balance';
import LightningPayment from './LightningPayment';
import PaymentDetails from './PaymentDetails';
import Sent from './Sent';
import To from './To';

export default {
  components: {
    Amount,
    Balance,
    LightningPayment,
    PaymentDetails,
    Sent,
    To,
  },

  props: {
    keep: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      currency: '',
      editing: false,
    };
  },

  computed: {
    ...mapGetters([
      'loading',
      'payment',
      'user',
    ]),
  },

  methods: {
    ...mapActions([
      'clearPayment',
      'estimateFee',
      'setCurrency',
    ]),

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
