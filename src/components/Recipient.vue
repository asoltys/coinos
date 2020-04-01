<template>
  <v-card class="elevation-1 pa-2 my-4" v-if="address">
    <v-textarea
      rows="1"
      label="Recipient"
      v-model="address"
      :readonly="!editingAddress"
      @focus="select"
      auto-grow
    >
      <template v-slot:append>
        <v-btn @click="$emit('back')" class="ml-1" icon>
          <v-icon class="mr-1">clear</v-icon>
        </v-btn>
        <v-btn @click="explore" class="ml-1" icon>
          <v-icon class="mr-1">open_in_new</v-icon>
        </v-btn>
        <v-btn @click="() => copy(address)" class="ml-1" icon>
          <v-icon class="mr-1">content_copy</v-icon>
        </v-btn>
      </template>
    </v-textarea>
    <v-text-field
      class="amount"
      label="Amount"
      v-model="displayAmount"
      readonly
      @click="setAmount"
    >
      <template v-slot:append>
        <v-btn
          class="toggle black--text ml-2 mt-auto mb-1"
          color="yellow"
          @click.prevent="toggle"
          >{{ currency }}</v-btn
        >
        <v-btn icon @click="() => copy(displayAmount)" class="ml-1" text>
          <v-icon class="mr-1">content_copy</v-icon>
        </v-btn>
      </template>
    </v-text-field>
    <v-text-field
      :loading="loadingFee"
      label="Fee"
      v-model="displayFee"
      readonly
      @click="setFee"
    >
      <template v-slot:append>
        <v-btn
          class="toggle black--text ml-2 mt-auto mb-1"
          color="yellow"
          @click.prevent="toggle"
          >{{ currency }}</v-btn
        >
        <v-btn icon @click="() => copy(displayFee)" class="ml-1" text>
          <v-icon class="mr-1">content_copy</v-icon>
        </v-btn>
      </template>
    </v-text-field>
    <set-fee :adjusting="adjusting" />
  </v-card>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';
import SetFee from './SetFee';
import Copy from '../mixins/Copy';

const SATS = 100000000;
const bs = 'https://blockstream.info';

export default {
  components: { SetFee },
  mixins: [Copy],
  props: {
    amount: { type: Number },
    fiatAmount: { type: String },
  },
  data() {
    return {
      adjusting: false,
      editingAddress: false,
    };
  },
  computed: {
    currency() {
      return this.fiat ? this.user.currency : this.user.unit;
    },
    address: sync('address'),
    addressType: sync('addressType'),
    displayAmount() {
      return this.fiat
        ? this.fiatAmount
        : this.user.unit === 'SAT'
        ? this.amount
        : Number((this.amount / SATS).toFixed(8));
    },
    displayFee() {
      return this.fiat ? this.fiatFee : this.user.unit === 'SAT' ? this.fee : Number((this.fee / SATS).toFixed(8));
    },
    fee() {
      if (this.tx) return parseInt(this.tx.fee * SATS);
      else return null;
    },
    fiatFee() {
      return ((this.fee * this.rate) / SATS).toFixed(2);
    },
    feeRate: sync('feeRate'),
    fiat: sync('fiat'),
    loadingFee: get('loadingFee'),
    rate: get('rate'),
    user: get('user'),
    tx: get('tx'),
  },
  methods: {
    toggle() {
      this.fiat = !this.fiat;
    },
    explore() {
      this.$nextTick(function() {
        if (this.addressType === 'bitcoin')
          window.open(`${bs}/address/${this.address}`);
        else window.open(`${bs}/liquid/address/${this.address}`);
      });
    },
    snack: call('snack'),
    select(e) {
      if (!e.target.readOnly) e.target.select();
    },
    setAmount() {
      this.$emit('editingAmount');
    },
    setFee() {
      this.adjusting = !this.adjusting;
    },
    estimateFee: call('estimateFee'),
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
</style>
