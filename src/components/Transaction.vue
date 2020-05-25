<template>
  <v-card class="elevation-1 pa-2 mb-2">
    <v-textarea
      v-if="recipient"
      rows="1"
      label="Recipient"
      v-model="recipient"
      @focus="select"
      readonly
      auto-grow
    >
      <template v-slot:prepend-inner>
        <network-icon :network="payment.network" />
      </template>
      <template v-slot:append>
        <v-btn @click="clearPayment" class="ml-1" icon>
          <v-icon class="mr-1">clear</v-icon>
        </v-btn>
        <v-btn @click="explore" class="ml-1" icon>
          <v-icon class="mr-1">open_in_new</v-icon>
        </v-btn>
        <v-btn @click="copy(recipient)" class="ml-1" icon>
          <v-icon class="mr-1">content_copy</v-icon>
        </v-btn>
      </template>
    </v-textarea>
    <v-select
      label="Asset"
      v-if="payment.network === 'LBTC'"
      v-model="user.account_id"
      @input="changeAsset"
      :items="accounts"
    />
    <v-text-field
      class="amount"
      label="Amount"
      v-model="displayAmount"
      readonly
      @click="$emit('edit')"
    >
      <template v-slot:append>
        <v-btn
          class="toggle black--text mt-auto"
          :color="fiat ? 'yellow' : 'white'"
          @click.prevent="toggle"
          >{{ currency }}</v-btn
        >
        <v-btn icon @click="copy(displayAmount)" class="ml-1" text>
          <v-icon class="mr-1">content_copy</v-icon>
        </v-btn>
      </template>
    </v-text-field>
    <v-text-field
      v-if="payment.address"
      :loading="loadingFee"
      label="Fee"
      v-model="displayFee"
      readonly
      @click="setFee"
    >
      <template v-slot:append>
        <v-btn
          class="toggle black--text mt-auto"
          :color="fiat ? 'yellow' : 'white'"
          @click.prevent="toggle"
          >{{ currency }}</v-btn
        >
        <v-btn icon @click="copy(displayFee)" class="ml-1" text>
          <v-icon class="mr-1">content_copy</v-icon>
        </v-btn>
      </template>
    </v-text-field>
    <set-fee :adjusting="adjusting" />

    <div class="d-flex" v-if="psbt">
      <v-btn @click="copy(psbt)" class="ml-auto">
        <v-icon class="mr-1">content_copy</v-icon>
        Copy {{ payment.network === 'bitcoin' ? 'PSBT' : 'PSET' }}
      </v-btn>
    </div>
  </v-card>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';
import SetFee from './SetFee';
import Copy from '../mixins/Copy';
import NetworkIcon from './NetworkIcon';

const SATS = 100000000;
const bs = 'https://blockstream.info';

export default {
  components: { NetworkIcon, SetFee },
  mixins: [Copy],
  props: {
    amount: { type: Number },
    fiatAmount: { type: String },
  },
  data() {
    return {
      asset: null,
      adjusting: false,
    };
  },
  computed: {
    psbt: get('psbt'),
    recipient() {
      let { address, payobj } = this.payment;
      if (payobj) return payobj.payeeNodeKey;
      return address;
    },
    accounts() {
      return this.user.accounts.map(a => ({ text: a.name, value: a.id }));
    },
    isBtc() {
      return this.user.account.ticker === 'BTC';
    },
    currency() {
      if (this.isBtc) return this.fiat ? this.user.currency : this.user.unit;
      else return this.user.account.ticker;
    },
    displayAmount() {
      return this.fiat
        ? this.payment.fiatAmount
        : this.user.unit === 'SAT'
        ? this.payment.amount
        : this.$format(this.payment.amount);
    },
    displayFee() {
      return this.fiat
        ? this.fiatFee
        : this.user.unit === 'SAT'
        ? this.fee
        : this.$format(this.fee, 8);
    },
    fee() {
      if (this.payment.tx) return parseInt(this.payment.tx.fee * SATS);
      else return null;
    },
    fiatFee() {
      if (!this.fee) return null;
      return ((this.fee * this.rate) / SATS).toFixed(2);
    },
    fiat: sync('fiat'),
    loadingFee: get('loadingFee'),
    payment: sync('payment'),
    rate: get('rate'),
    user: get('user'),
  },
  methods: {
    changeAsset(id) {
      let { asset } = this.user.accounts.find(a => a.id === id);
      this.shiftAccount(asset);
    },
    clearPayment: call('clearPayment'),
    toggle() {
      if (this.user.account.ticker !== 'BTC') return;
      this.fiat = !this.fiat;
    },
    explore() {
      this.$nextTick(function() {
        if (this.network === 'bitcoin')
          window.open(`${bs}/address/${this.payment.address}`);
        else window.open(`${bs}/liquid/address/${this.payment.address}`);
      });
    },
    select(e) {
      if (!e.target.readOnly) e.target.select();
    },
    setFee() {
      this.adjusting = !this.adjusting;
    },
    shiftAccount: call('shiftAccount'),
  },
  mounted() {
    this.asset = this.user.account.id;
  },
};
</script>

<style lang="stylus" scoped>
.v-application code
  max-width 100%
  word-wrap break-word
  padding 10px
  font-size 1em

.v-application code:before
  display none

.theme--dark.v-input input
  cursor pointer !important

@media (max-width: 600px)
  .v-application code
    font-size 0.8em

.toggle
  max-height 24px
  margin-top -12px
  margin-bottom 6px
  min-width 44px !important
  width 44px !important
</style>
