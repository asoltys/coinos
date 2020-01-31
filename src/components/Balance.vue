<template>
  <div v-if="!isNaN(animatedBalance)" class="mb-2 text-center">
    <span class="display-2 font-weight-black">{{ animatedBalance }} </span>
    <span class="headline">SAT</span>
    <h3 v-if="!isNaN(animatedRate)" class="d-flex flex-wrap justify-center">
      <div class="fiat yellow--text display-1">{{ fiat | format }}</div>
      <v-btn
        class="toggle black--text mx-1"
        color="yellow"
        @click="shiftCurrency"
        >{{ user.currency }}</v-btn
      >
      <div class="rate">
        <span>
          @
          <span class="font-weight-black yellow--text">{{
            animatedRate | format
          }}</span>
          / BTC
        </span>
      </div>
    </h3>
    <div
      class="orange--text text--lighten-3"
      v-if="user.pending && !isNaN(animatedPending)"
    >
      <span class="display-1 font-weight-black">{{ animatedPending }} </span>
      <span class="headline">PENDING</span>
      <h3>{{ pendingFiat | format }} {{ user.currency }}</h3>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { TweenLite } from 'gsap';
import { call } from 'vuex-pathify';

export default {
  props: { payobj: { type: Object } },

  data() {
    return {
      tweenedBalance: null,
      tweenedPending: null,
      tweenedRate: null,
    };
  },

  filters: {
    format(n) {
      return parseFloat(n).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
  },

  computed: {
    ...mapGetters(['rate', 'user']),
    fiat() {
      return (this.animatedBalance / 100000000) * this.animatedRate;
    },
    pendingFiat() {
      return (this.animatedPending / 100000000) * this.animatedRate;
    },
    animatedBalance() {
      return parseInt(this.tweenedBalance).toFixed(0);
    },
    animatedPending() {
      return parseInt(this.tweenedPending).toFixed(0);
    },
    animatedRate() {
      return parseFloat(this.tweenedRate).toFixed(2);
    },
  },

  methods: {
    shiftCurrency: call('shiftCurrency'),
  },

  watch: {
    rate(rate) {
      let tweenedRate = rate;
      TweenLite.to(this.$data, 0.5, { tweenedRate });
    },

    user: {
      handler(user) {
        let tweenedBalance = user.balance;
        let tweenedPending = user.pending;

        if (user.pending === 0) user.pending = null;

        TweenLite.to(this, 0.5, { tweenedBalance });
        TweenLite.to(this, 0.5, { tweenedPending });

        if (!this.tweenedBalance) this.tweenedBalance = 0;
      },
      deep: true,
    },
  },

  created() {
    this.tweenedBalance = this.user.balance;
    this.tweenedPending = this.user.pending;
    this.tweenedRate = this.rate;
  },
};
</script>

<style lang="stylus" scoped>
.fiat
  margin-top -6px

.rate
  margin-top 2px

.toggle
  max-height 28px
  min-width 0
</style>
