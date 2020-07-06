<template>
  <div v-if="lnurl">
    <v-card class="elevation-1 my-2 pa-4">
      <div class="text-center headline">{{ lnurl.defaultDescription }}</div>
      <div class="d-flex justify-center">
        <div class="mr-2 text-center">
          <div><span class="yellow--text">Min:</span> <span class="headline">{{ lnurl.minWithdrawable }}</span> SAT</div>
          <div><span class="yellow--text">Max:</span> <span class="headline">{{ lnurl.maxWithdrawable }}</span> SAT</div>
        </div>
      </div>
    </v-card>
    <amount v-model.number="amount" :max="lnurl.maxWithdrawable" class="mb-2" />
      <div class="d-flex">
        <v-btn
          class="black--text flex-grow-1"
          color="primary"
          dark
          @click="submit"
        >
          <v-icon left>send</v-icon><span>Withdraw</span>
        </v-btn>
      </div>
  </div>
</template>

<script>
import Amount from './Amount';
import { get, call, sync } from 'vuex-pathify';

const SATS = 100000000;

export default {
  components: { Amount },
  data() {
    return {
      amount: null,
      result: null,
    };
  },
  methods: {
    submit() {
      this.withdraw(this.amount);
    },
    withdraw: call('withdraw'),
  },
  computed: {
    lnurl: get('lnurl'),
  },
  mounted() {
    if (!this.lnurl) return this.$go('/home');
    console.log(this.lnurl.maxWithdrawable);
    this.amount = this.lnurl.maxWithdrawable;
  },
};
</script>
