<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <template v-else>
      <Balance />
      <sent v-if="payment" v-bind="{ back, payment }" />
      <template v-else>
        <div v-if="!(payobj || payuser || address)">
          <v-textarea
            class="my-4"
            label="Address or Invoice:"
            dark
            v-model="to"
            clearable
            auto-grow
            rows="1"
            hide-details
            autofocus
          />
          <v-btn
            class="mr-2 mb-2"
            v-if="user.fbtoken"
            @click="$router.push('/contacts')"
          >
            <v-icon class="mr-1">person</v-icon>
            <span>Address Book</span>
          </v-btn>
        </div>
        <recipient v-bind="{ address, scannedBalance }" />
        <send-to-user v-bind="{ payuser }" />
        <template v-if="address || payuser">
          <numpad class="mb-2" />
        </template>
        <payment-details :payobj="payobj" />
        <div class="d-flex flex-wrap">
          <v-btn
            class="order-first order-sm-last mb-2 flex-grow-1"
            v-if="!loading && to"
            color="green"
            dark
            @click="sendPayment"
          >
            <v-icon class="mr-1">send</v-icon><span>Pay</span>
          </v-btn>
          <v-btn @click="back" class="mr-2 flex-grow-1">
            <v-icon>arrow_back</v-icon><span>Go Back</span>
          </v-btn>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Balance from './Balance';
import Numpad from './NumPad';
import Recipient from './Recipient';
import Sent from './Sent';
import PaymentDetails from './PaymentDetails';
import SendToUser from './SendToUser';

export default {
  components: {
    Balance,
    Numpad,
    SendToUser,
    Sent,
    PaymentDetails,
    Recipient,
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
      fiat: false,
    };
  },

  computed: {
    ...mapGetters([
      'address',
      'amount',
      'fees',
      'friends',
      'balance',
      'loading',
      'user',
      'payment',
      'payreq',
      'payobj',
      'payuser',
      'rate',
      'scannedBalance',
    ]),

    to: {
      get() {
        if (this.payreq) return this.payreq;
        if (this.address) return this.address;
        if (this.payuser) return this.payuser;
        return null;
      },
      set(v) {
        if (!v) v = '';
        this.$store.dispatch('handleScan', v.trim());
      },
    },
  },

  methods: {
    ...mapActions(['sendPayment', 'clearPayment', 'snack']),

    init() {
      if (!this.keep) this.clearPayment();
      if (this.$route.query.refresh !== undefined) {
        this.$router.replace(this.$route.path);
      }
    },

    back() {
      if (this.payreq || this.address) return this.clearPayment();
      if (this.payuser) return this.$router.push('/contacts');
      return this.$router.push('/home');
    },
  },

  beforeRouteUpdate(to, from, next) {
    next();
    this.init();
  },

  mounted() {
    this.init();
    this.$store.commit('payuser', this.$route.query.payuser);
  },
};
</script>

<style lang="stylus" scoped>
@media (max-width: 600px)
  .v-btn
    width 100%
    height 62px !important
</style>
