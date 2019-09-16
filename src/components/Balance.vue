<template>
  <div class="mb-2 text-center">
    <span class="display-2 font-weight-black">{{ animatedBalance }} </span>
    <span class="headline">SAT</span>
    <h3>
      {{ ((animatedBalance / 100000000) * animatedRate).toFixed(2) }} CAD @
      <span class="font-weight-black yellow--text">{{ animatedRate }}</span>
      per BTC
    </h3>
    <div class="yellow--text text--lighten-3" v-if="user.pending">
      <span class="display-2">{{ animatedPending }} </span>
      <span class="headline">pending</span>
      <h3>
        {{ ((animatedPending / 100000000) * animatedRate).toFixed(2) }} CAD
      </h3>
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

  computed: {
    ...mapGetters(['rate', 'user']),
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
