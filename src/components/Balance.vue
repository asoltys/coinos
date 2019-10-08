<template>
  <div class="mb-2 text-center">
    <span class="display-2 font-weight-black">{{ animatedBalance }} </span>
    <span class="headline">SAT</span>
    <h3>
      {{ fiat | format }} CAD @
      <span class="font-weight-black yellow--text">{{
        animatedRate | format
      }}</span>
      per BTC
    </h3>
    <div class="yellow--text text--lighten-3" v-if="user.pending">
      <span class="display-2">{{ animatedPending }} </span>
      <span class="headline">pending</span>
      <h3>{{}} CAD</h3>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { TweenLite } from 'gsap';

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
