<template>
  <div>
    <v-progress-linear v-if="loading || !rates" indeterminate />
    <template v-else-if="invoice.text">
      <request
        v-if="!(invoice.amount || invoice.received) || (invoice.amount && invoice.received < invoice.amount)"
        @clear="clearInvoice"
      />
      <balance v-else-if="user.username === currentUser.username" />
      <received v-if="invoice.received" />
    </template>
    <div v-else>
      <numpad
        @done="addInvoice()"
        @input="updateAmount"
        :currencies="currencies"
        :initialAmount="invoice.amount"
        :initialRate="rate"
      />

      <v-card class="mb-1" v-if="showingMemo">
        <v-card-text>
          <v-textarea
            label="Memo"
            v-model="invoice.memo"
            rows="1"
            ref="memo"
            auto-grow
            auto-focus
          />
        </v-card-text>
      </v-card>
      <div class="d-flex flex-wrap buttons" v-else>
        <v-btn class="flex-grow-1 mb-1" @click="addInvoice()">
          <v-icon left color="primary">$send</v-icon>
          Go
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
import { get, call, sync } from 'vuex-pathify';
import goTo from 'vuetify/es5/services/goto';

export default {
  components: { Balance, Numpad, Received, Request },

  data() {
    return {
      loading: false,
      btc: process.env.VUE_APP_LBTC,
      showingMemo: false,
    };
  },

  computed: {
    networks() {
      return this.nodes.map(n => n.charAt(0).toUpperCase() + n.slice(1));
    },
    buttonStyle() {
      let numButtons = this.user.account.pubkey ? 2 : this.user.account.asset === this.btc ? this.nodes.length : 1;
      return {
        maxWidth: `${(100 / (window.innerWidth < 600 ? 1 : numButtons)).toFixed(
          0
        )}%`,
      };
    },
    isBtc() {
      return this.user.account && this.user.account.asset === process.env.VUE_APP_LBTC;
    },
    currencies() {
      if (!(this.user.accounts && this.user.currencies)) return [];

      return [
        'SAT',
        'BTC',
        ...[
          ...this.user.accounts
            .filter(a => !a.hide && a.pubkey === this.user.account.pubkey)
            .map(a => (a.ticker || a.asset.substr(0,3).toUpperCase()))
            .filter(a => a !== 'BTC'),
        ].sort(),
        ...[...this.user.currencies].sort(),
      ];
    },
    invoice: sync('invoice'),
    nodes: get('nodes'),
    rate: get('rate'),
    rates: get('rates'),
    received: sync('received'),
    currentUser: get('user'),
    user() {
      return this.invoice.user.username ? this.invoice.user : this.currentUser;
    },
  },

  methods: {
    showMemo() {
      this.showingMemo = true;
      this.$nextTick(() => {
        this.$refs.memo.focus();
        setTimeout(
          () => goTo(this.$refs.memo, { offset: 15 }),
          100
        );
      });
    },
    addInvoice: call('addInvoice'),
    clearInvoice: call('clearInvoice'),
    snack: call('snack'),
    setCurrency: call('setCurrency'),

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
    this.$nextTick(() => {
      if (!this.invoice.user.username && this.user.username) {
        this.$set(this.invoice, 'user', JSON.parse(JSON.stringify(this.user)));
      }
    });
  },
};
</script>

<style lang="stylus" scoped>
.buttons
  width: 100%;

@media (max-width: 600px)
  .buttons .v-btn
    max-width none
    width 100%
    height 62px !important

.buttons .v-btn
  height 8vh !important
  min-height 60px
</style>
