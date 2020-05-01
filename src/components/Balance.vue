<template>
  <div v-if="user.account.balance" class="mb-2 text-center">
    <span class="display-2 font-weight-black">{{ btc(user.account.balance) }} </span>
      <v-btn
        class="black--text unitToggle"
        color="white"
        @click="shiftAccount"
        >{{ ticker }}</v-btn>
    <h3 v-if="!isNaN(animatedRate) && isBtc" class="d-flex flex-wrap justify-center">
      <div class="fiat yellow--text display-1">{{ fiat | format }}</div>
      <v-btn
        class="toggle black--text"
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
      v-if="user.account.pending"
    >
      <span class="display-1 font-weight-black">{{ btc(user.account.pending) }} </span>
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
    ticker() {
      return this.isBtc ? this.user.unit : this.user.account.ticker;
    },
    isBtc() {
      return this.user.account.ticker === 'BTC';
    }, 
    fiat() {
      return (this.user.account.balance / SATS) * this.animatedRate;
    },
    pendingFiat() {
      return (this.user.account.pending / SATS) * this.animatedRate;
    },
    animatedRate() {
      return parseFloat(this.tweenedRate).toFixed(2);
    },
  },

  methods: {
    shiftAccount: call('shiftAccount'),
    shiftCurrency: call('shiftCurrency'),
  },

  watch: {
    rate(rate) {
      let tweenedRate = rate;
      TweenLite.to(this.$data, 0.5, { tweenedRate });
    },
  },

  created() {
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
  margin auto 0.25rem !important
  margin-top 0 !important
  height 1.75rem !important
  min-width 3rem !important
  width 3rem !important

.unitToggle
  margin-top -25px
  max-height 34px !important
  margin-left -8px
</style>
