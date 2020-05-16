<template>
  <div>
    <numpad
      class="mb-2"
      @done="$emit('done')"
      :currencies="currencies"
      :initialAmount="payment.amount"
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
    currency: sync('currency'),
    rate: get('rate'),
    currencies() {
      let user = this.user;
      if (user.account.ticker === 'BTC') {
        return [...user.currencies, 'SAT', 'BTC'];
      }
      return [user.account.ticker];
    },
    payment: get('payment'),
    user: get('user'),
  },
  methods: {
    updateAmount(amount, fiatAmount, currency) {
      this.payment.amount = amount;
      this.payment.fiatAmount = fiatAmount;
      this.currency = currency;
    },

  } 
};
</script>
