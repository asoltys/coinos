<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <template v-else>
      <Balance />
      <sent v-if="payment.sent" />
      <template v-else>
        <to v-if="!(payment.payobj || payment.address || payment.recipient)" />
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
import PaymentDetails from './PaymentDetails';
import Sent from './Sent';
import To from './To';

export default {
  components: {
    Amount,
    Balance,
    PaymentDetails,
    Sent,
    To,
  },

  filters: {
    trim: w => w.substring(0, 12),
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
