<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <template v-else-if="invoice.text">
      <request
        v-if="invoice.amount === null || invoice.received < invoice.amount"
        @clear="clearInvoice"
      />
      <balance v-else />
      <received v-if="invoice.received" @clear="clearInvoice" />
    </template>
    <div v-else>
      <numpad
        @done="() => addInvoice('lightning')"
        @input="updateAmount"
        :currencies="currencies"
        :initialAmount="invoice.amount"
        :initialRate="rate"
      />

      <div class="d-flex flex-wrap buttons">
        <v-btn
          class="flex-grow-1 mb-2 mr-1"
          @click="addInvoice('bitcoin')"
          :disabled="user.account.ticker !== 'BTC'"
        >
          <img class="mr-1" src="../assets/bitcoin.png" width="30px" />
          <span>Bitcoin</span>
        </v-btn>

        <v-btn
          class="flex-grow-1 mb-2 mr-1"
          @click="addInvoice('lightning')"
          :disabled="user.account.ticker !== 'BTC' || invoice.amount <= 0"
        >
          <flash fillColor="yellow" />
          <span>Lightning</span>
        </v-btn>

        <v-btn class="flex-grow-1 mr-0" @click="addInvoice('liquid')">
          <water fillColor="#00aaee" />
          <span>Liquid</span>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import Balance from './Balance';
import Numpad from './NumPad';
import Received from './Received';
import Request from './Request';
import { mapActions } from 'vuex';
import Flash from 'vue-material-design-icons/Flash';
import Water from 'vue-material-design-icons/Water';
import { get, call, sync } from 'vuex-pathify';

export default {
  components: { Balance, Flash, Numpad, Received, Request, Water },

  computed: {
    currencies() {
      let currencies = this.user.accounts.map(a => a.ticker);
      if (this.user.account.ticker === 'BTC')
        currencies = [...currencies, 'SAT', ...this.user.currencies];
      return currencies;
    },
    invoice: sync('invoice'),
    loading: sync('loading'),
    payment: get('payment'),
    rate: get('rate'),
    received: sync('received'),
    user: sync('user'),
  },

  methods: {
    ...mapActions(['addInvoice', 'clearInvoice', 'snack', 'setCurrency']),

    updateAmount(amount, fiatAmount, currency) {
      this.setCurrency(currency);
      this.$nextTick(() => {
        this.invoice.amount = amount;
        this.invoice.fiatAmount = fiatAmount;
      });
    },

    checkRefresh() {
      if (this.$route.query.refresh !== undefined) {
        this.$router.replace(this.$route.path);
      } else {
        this.clearInvoice();
      }
    },
  },

  beforeRouteUpdate(to, from, next) {
    next();
    this.checkRefresh();
  },

  mounted() {
    this.clearInvoice();
    this.checkRefresh();
  },
};
</script>

<style lang="stylus" scoped>
canvas
  position relative
  display block
  height 100%
  margin-left auto
  margin-right auto

.buttons
  width: 100%;

.buttons .v-btn
  max-width 33%

@media (max-width: 600px)
  .buttons .v-btn
    max-width none
    width 100%
    height 62px !important

.buttons .v-btn
  height 8vh !important
  min-height 60px
</style>
