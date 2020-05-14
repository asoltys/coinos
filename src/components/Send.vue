<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <template v-else>
      <Balance />
      <sent v-if="payment" v-bind="{ back, payment }" />
      <template v-else>
        <div v-if="!(payobj || address)">
          <v-textarea
            class="my-4"
            label="Address or Invoice:"
            dark
            v-model="to"
            clearable
            auto-grow
            rows="1"
            hide-details
            @input="() => handleScan(to)"
            ref="to"
            :error="to.length > 0"
          >
            <template v-if="to.length" v-slot:append>
              <v-btn icon @click="() => showText(to)" class="ml-1" text>
                <qrcode />
              </v-btn>
              <v-btn @click="() => copy(to)" class="ml-1" icon>
                <v-icon class="mr-1">content_copy</v-icon>
              </v-btn>
            </template>
          </v-textarea>
          <v-chip v-if="to.length > 0" class="black--text mb-2" color="white">
            <v-icon color="black" left>warning</v-icon>
            Can't parse address or payment request
          </v-chip>
          <div class="d-flex flex-wrap">
            <v-btn v-if="canPaste" class="mr-2 mb-2 flex-grow-1" @click="paste">
              <v-icon class="mr-1">assignment</v-icon>
              <span>Paste</span>
            </v-btn>
            <v-btn @click="back" class="mr-2 flex-grow-1">
              <v-icon>arrow_back</v-icon><span>Go Back</span>
            </v-btn>
          </div>
        </div>
        <template v-else-if="editingAmount">
          <numpad
            class="mb-2"
            @done="stopEditingAmount"
            :currencies="currencies"
            :initialAmount="amount"
            :initialRate="rate"
            @input="updateAmount"
          />
          <div class="d-flex">
            <v-btn
              class="black--text flex-grow-1"
              color="primary"
              dark
              @click="stopEditingAmount"
            >
              <v-icon class="mr-1">check</v-icon><span>Done</span>
            </v-btn>
          </div>
        </template>
        <div v-else>
          <transaction
            v-bind="{ address, amount, fiatAmount }"
            @editingAmount="startEditingAmount"
            @back="back"
          />
          <lightning-payment
            v-if="payobj"
            :payobj="payobj"
            v-bind="{ amount, fiatAmount }"
            @editingAmount="startEditingAmount"
          />
          <div v-if="!loading">
            <recipient v-if="recipient" @internal="sendInternal" @pay="sendPayment" />
            <div v-else class="d-flex flex-wrap">
              <v-btn
                class="order-first order-sm-last mb-2 flex-grow-1"
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
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { sync } from 'vuex-pathify';

import Balance from './Balance';
import Numpad from './NumPad';
import LightningPayment from './LightningPayment';
import Recipient from './Recipient';
import Sent from './Sent';
import Transaction from './Transaction';

import Qrcode from 'vue-material-design-icons/Qrcode';
import Copy from '../mixins/Copy';

export default {
  mixins: [Copy],
  components: {
    Balance,
    LightningPayment,
    Numpad,
    Qrcode,
    Recipient,
    Sent,
    Transaction,
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
      editingAmount: false,
      to: '',
    };
  },

  computed: {
    amount: sync('amount'),
    canPaste() {
      return navigator.clipboard;
    },
    currencies() {
      let user = this.user;
      if (user.account.ticker === 'BTC') {
        return [...user.currencies, 'SAT', 'BTC'];
      }
      return [user.account.ticker];
    },
    fiat: sync('fiat'),
    fiatAmount: sync('fiatAmount'),
    ...mapGetters([
      'address',
      'asset',
      'assets',
      'loading',
      'network',
      'user',
      'payment',
      'payreq',
      'payobj',
      'rate',
      'recipient',
    ]),
  },

  methods: {
    ...mapActions([
      'clearPayment',
      'estimateFee',
      'handleScan',
      'sendInternal',
      'sendPayment',
      'setCurrency',
      'showText',
      'snack',
    ]),

    async paste() {
      this.to = await navigator.clipboard.readText();
      this.handleScan(this.to);
    },

    updateAmount(amount, fiatAmount, currency) {
      this.amount = amount;
      this.fiatAmount = fiatAmount;
      this.currency = currency;
    },

    startEditingAmount() {
      this.editingAmount = true;
    },

    stopEditingAmount() {
      this.editingAmount = false;
      this.estimateFee();
      this.setCurrency(this.currency);
    },

    init() {
      this.to = '';
      if (!this.keep) this.clearPayment();
      if (this.$route.query.refresh !== undefined) {
        this.$router.replace(this.$route.path);
      }
    },

    back() {
      this.to = '';
      if (this.payreq || this.address) return this.clearPayment();
      return this.$router.push('/home');
    },
  },

  beforeRouteUpdate(to, from, next) {
    next();
    this.init();
  },

  mounted() {
    this.init();
    const vw = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    if (vw > 600 && this.$refs.to) this.$refs.to.focus();
  },
};
</script>

<style lang="stylus" scoped>
@media (max-width: 600px)
  .v-btn
    width 100%
    height 62px !important
</style>
