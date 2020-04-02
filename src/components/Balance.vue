<template>
  <div v-if="!isNaN(animatedBalance)" class="mb-2 text-center">
    <span class="display-2 font-weight-black">{{ animatedBalance }} </span>
      <v-btn
        class="black--text unitToggle"
        color="white"
        @click="toggleUnit"
        >{{ user.unit }}</v-btn>
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
                class="red--text"
      v-if="user.pending && !isNaN(animatedPending)"
    >
      <span class="display-1 font-weight-black">{{ animatedPending }} </span>
      <span class="headline">UNCONFIRMED</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { TweenLite } from 'gsap';
import { call } from 'vuex-pathify';
import Utils from '../mixins/Utils';

const SATS = 100000000;

export default {
  mixins: [Utils],
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
      return (this.tweenedBalance / SATS) * this.animatedRate;
    },
    pendingFiat() {
      return (this.animatedPending / SATS) * this.animatedRate;
    },
    animatedBalance() {
      return this.btc(this.tweenedBalance);
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

.unitToggle
  margin-top -22px
  max-height 30px
  margin-left -4px
</style>
