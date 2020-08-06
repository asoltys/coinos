<template>
  <div>
    <v-progress-linear v-if="loading || !rates" indeterminate />
    <template v-else-if="invoice.text">
      <request
        v-if="invoice.amount === null || invoice.received < invoice.amount"
        @clear="clearInvoice"
      />
      <balance v-else-if="user.username === currentUser.username" />
      <received v-if="invoice.received" />
    </template>
    <div v-else>
      <numpad
        @done="addInvoice({ method: 'lightning', user })"
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
        <v-btn class="flex-grow-1 mb-1" @click="showMemo">
          <v-icon left>$note</v-icon>
          Add Memo
        </v-btn>
      </div>
      <div class="d-flex flex-wrap buttons">
        <v-btn
          v-if="nodes.includes('bitcoin')"
          class="flex-grow-1 mb-1 mr-1"
          @click="addInvoice({ method: 'bitcoin', user })"
          :disabled="!isBtc"
          :style="buttonStyle"
        >
          <img class="mr-1" src="../assets/bitcoin.png" width="30px" />
          <span>Bitcoin</span>
        </v-btn>

        <v-btn
          v-if="nodes.includes('lightning')"
          class="flex-grow-1 mb-1 mr-1"
          @click="addInvoice({ method: 'lightning', user })"
          :disabled="!isBtc"
          :style="buttonStyle"
        >
          <flash fillColor="yellow" />
          <span>Lightning</span>
        </v-btn>

        <v-btn
          v-if="nodes.includes('liquid')"
          class="flex-grow-1 mr-0"
          @click="addInvoice({ method: 'liquid', user })"
          :style="buttonStyle"
        >
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
import Flash from 'vue-material-design-icons/Flash';
import Water from 'vue-material-design-icons/Water';
import { get, call, sync } from 'vuex-pathify';

export default {
  components: { Balance, Flash, Numpad, Received, Request, Water },

  data() {
    return {
      showingMemo: false,
    };
  },

  computed: {
    buttonStyle() {
      return {
        maxWidth: `${(
          100 / (window.innerWidth < 600 ? 1 : this.nodes.length)
        ).toFixed(0)}%`,
      };
    },
    isBtc() {
      return this.user.account && this.user.account.ticker === 'BTC';
    },
    currencies() {
      if (!(this.user.accounts && this.user.currencies)) return [];

      return [
        'SAT',
        'BTC',
        ...[
          ...this.user.accounts.map(a => a.ticker).filter(a => a !== 'BTC'),
        ].sort(),
        ...[...this.user.currencies].sort(),
      ];
    },
    invoice: sync('invoice'),
    loading: sync('loading'),
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
      if (!this.invoice.user.username)
        this.$set(this.invoice, 'user', this.user);
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
