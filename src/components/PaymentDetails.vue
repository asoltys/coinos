<template>
  <v-card class="elevation-1 my-2 pa-4" v-if="payobj">
    <div class="text-center font-weight-bold">Pay</div>
    <div v-if="payobj.satoshis" class="d-flex justify-center">
      <div class="mr-2">
        <span class="display-1">{{ payobj.satoshis }}</span> SAT
      </div>
      <div>
        <span class="yellow--text">
          <span class="display-1">{{ fiatAmount }}</span>
          {{ user.currency }}
        </span>
      </div>
    </div>
    <v-text-field
      v-else
      class="amount"
      label="Amount"
      v-model="displayAmount"
      readonly
      @click="setAmount"
    >
      <template v-slot:append>
        <v-btn
          class="toggle black--text mt-auto"
          :color="fiat ? 'yellow' : 'white'"
          @click.prevent="toggle"
          >{{ currency }}</v-btn
        >
        <v-btn icon @click="() => copy(displayAmount)" class="ml-1" text>
          <v-icon class="mr-1">content_copy</v-icon>
        </v-btn>
      </template>
    </v-text-field>
    <div v-if="fee !== null" class="text-center">
      <div>
        <span class="headline grey--text">+ Routing Fee: </span>
        <span class="headline">{{ fee }}</span> {{ user.unit }}
      </div>
    </div>
    <div class="text-center font-weight-bold my-2">to</div>
            <v-textarea label="Lightning Node" :value="payobj.payeeNodeKey" rows="1" auto-grow>
              <template v-slot:append>
                <v-btn @click="() => copy(payobj.payeeNodeKey)" icon>
                  <v-icon class="mr-1">content_copy</v-icon>
                </v-btn>
              </template>
            </v-textarea>
  </v-card>
</template>

<script>
import date from 'date-fns';
import { mapGetters } from 'vuex';
import { call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';

export default {
  mixins: [Copy],

  props: {
    amount: { type: Number },
    fiatAmount: { type: String },
    payobj: { type: Object },
  },

  computed: {
    ...mapGetters(['rate', 'route', 'user']),
    displayAmount() {
      return this.fiat
        ? this.fiatAmount
        : this.user.unit === 'SAT'
        ? this.amount
        : this.$format(this.amount);
    },
    isBtc() {
      return this.user.account.ticker === 'BTC';
    },
    currency() {
      if (this.isBtc) return this.fiat ? this.user.currency : this.user.unit;
      else return this.user.account.ticker;
    },
    fee() {
      if (!this.route) return null;
      return this.$format(parseInt(this.route.total_amt) - this.amount);
    },
    fiat: sync('fiat'),
  },

  methods: {
    queryRoutes: call('queryRoutes'),
    toggle() {
      if (this.user.account.ticker !== 'BTC') return;
      this.fiat = !this.fiat;
    },
    setAmount() {
      this.$emit('editingAmount');
    },
  },

  watch: {
    amount: {
      immediate: true,
      handler(v) {
        if (v) this.queryRoutes(v);
      },
    },
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
