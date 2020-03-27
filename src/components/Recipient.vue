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
    <v-text-field class="amount" label="Amount" v-model="amount" readonly suffix="sat" @click="setAmount">
      <template v-slot:append>
        <v-btn icon @click="() => copy(amount)" class="ml-1" text>
          <v-icon class="mr-1">content_copy</v-icon>
        </v-btn>
      </template>
    </v-text-field>
    <v-text-field :loading="loadingFee" label="Fee" v-model="fee" readonly suffix="sat" @click="setFee">
      <template v-slot:append>
        <v-btn icon @click="() => copy(fee)" class="ml-1" text>
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
  },
  data() {
    return {
      adjusting: false,
      editingAddress: false,
    };
  },
  computed: {
    address: sync('address'),
    addressType: sync('addressType'),
    fee() {
      if (this.tx) return parseInt(this.tx.fee * SATS);
      else return null;
    },
    feeRate: sync('feeRate'),
    loadingFee: get('loadingFee'),
    tx: get('tx'),
  },
  methods: {
    explore() {
      this.$nextTick(function() {
        if (this.addressType === 'bitcoin') window.open(`${bs}/address/${this.address}`);
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
