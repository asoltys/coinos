<template>
  <v-card v-if="user.account" class="elevation-1 pa-4 mb-2">
    <qr :text="recipient" v-if="show" />
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
          <v-icon>$cancel</v-icon>
        </v-btn>
        <v-btn icon @click="show = !show" class="ml-1" text>
          <qrcode />
        </v-btn>
        <v-btn @click="explore" class="ml-1" icon>
          <v-icon>$open</v-icon>
        </v-btn>
        <v-btn @click="copy(recipient)" class="ml-1" icon>
          <v-icon>$copy</v-icon>
        </v-btn>
      </template>
    </v-textarea>
    <v-select
      label="Asset"
      v-if="payment.network === 'LBTC'"
      v-model="user.account_id"
      @input="shiftAccount"
      :items="accounts"
    />
    <amount
      v-model.number="payment.amount"
      :max="max"
      class="mb-2"
      @done="$emit('feeRate')"
      :currency="currency"
      :key="currency"
    />
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
          :color="color(feeUnit)"
          @click.prevent="toggle"
          >{{ feeUnit }}</v-btn
        >
        <v-btn icon @click="copy(displayFee)" class="ml-1" text>
          <v-icon>$copy</v-icon>
        </v-btn>
      </template>
    </v-text-field>
    <set-fee :adjusting="adjusting" @closed="$emit('feeRate')" />

    <v-textarea label="Memo" v-model="payment.memo" rows="1" auto-grow />

    <v-switch label="Replaceable" v-model="payment.replaceable" @change="$emit('feeRate')"/>

    <div class="d-flex" v-if="psbt">
      <v-btn @click="copy(psbt)" class="ml-auto">
        <v-icon left>$copy</v-icon>
        Copy {{ payment.network === 'BTC' ? 'PSBT' : 'PSET' }}
      </v-btn>
    </div>
  </v-card>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';
import SetFee from './SetFee';
import Copy from '../mixins/Copy';
import NetworkIcon from './NetworkIcon';
import Qrcode from 'vue-material-design-icons/Qrcode';
import Qr from './Qr';
import Amount from './Amount';

const SATS = 100000000;
const bs = 'https://blockstream.info';

export default {
  components: { Amount, NetworkIcon, SetFee, Qr, Qrcode },
  mixins: [Copy],
  props: {
    amount: { type: Number },
    fiatAmount: { type: String },
    max: { type: Number },
  },
  data() {
    return {
      asset: null,
      adjusting: false,
      show: false,
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
    currency() {
      if (this.user.account.ticker === 'BTC') return null;
      else return this.user.account.ticker;
    },
    displayFee() {
      return this.user.fiat
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
    feeUnit() {
      return this.user.fiat
        ? this.user.currency
        : this.user.unit === 'SAT'
        ? 'SAT'
        : this.user.account.ticker;
    },
    loadingFee: get('loadingFee'),
    payment: sync('payment'),
    rate: get('rate'),
    user: get('user'),
  },
  methods: {
    color(c) {
      return ['BTC', 'SAT'].includes(c)
        ? 'white'
        : this.user.currencies.includes(c)
        ? '#ffeb3b'
        : '#0ae';
    },
    toggleFiat: call('toggleFiat'),
    clearPayment: call('clearPayment'),
    toggle() {
      if (this.user.account.ticker !== 'BTC') return;
      this.toggleFiat();
    },
    explore() {
      this.$nextTick(function() {
        if (this.payment.network === 'bitcoin')
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
</style>
