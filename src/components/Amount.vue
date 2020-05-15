<template>
  <div>
    <numpad
      class="mb-2"
      @done="$emit('done')"
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
        @click="$emit('done')"
      >
        <v-icon class="mr-1">check</v-icon><span>Done</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import Numpad from './NumPad';

export default {
  components: {
    Numpad,
  },
  computed: {
    amount: sync('amount'),
    currency: sync('currency'),
    fiatAmount: sync('fiatAmount'),
    rate: get('rate'),
    currencies() {
      let user = this.user;
      if (user.account.ticker === 'BTC') {
        return [...user.currencies, 'SAT', 'BTC'];
      }
      return [user.account.ticker];
    },
    user: get('user'),
  },
  methods: {
    updateAmount(amount, fiatAmount, currency) {
      this.amount = amount;
      this.fiatAmount = fiatAmount;
      this.currency = currency;
    },

  } 
};
</script>
