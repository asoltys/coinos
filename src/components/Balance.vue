<template>
  <div v-if="user.id && user.account" class="mb-2 text-center no-print">
    <div class="d-flex">
      <div class="display-2 font-weight-black flex-grow-1 text-right mr-2">
        {{ $format(user.account.balance, precision) }}
      </div>
      <div class="text-left flex-grow-1 my-auto">
        <currency-list :currency="ticker" :currencies="cryptos" />
      </div>
    </div>
    <h3
      v-if="!isNaN(animatedRate) && isBtc"
      class="d-flex flex-wrap justify-center"
    >
      <div class="fiat yellow--text display-1 my-auto">{{ fiat | format }}</div>
      <div class="mx-1">
        <currency-list :currency="user.currency" :currencies="fiats" />
      </div>
      <div class="mt-auto mb-1">
        <span>
          @
          <span class="font-weight-black yellow--text">{{
            animatedRate | format
          }}</span>
          / BTC
        </span>
      </div>
    </h3>
    <div class="red--text" v-if="user.account.pending">
      <span class="display-1 font-weight-black"
        >{{ $format(user.account.pending) }}
      </span>
      <span class="headline">UNCONFIRMED</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { call } from 'vuex-pathify';
import CurrencyList from './CurrencyList';

const ease = t => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t);
const BTC = process.env.VUE_APP_LBTC;
const SATS = 100000000;

export default {
  components: { CurrencyList },

  data() {
    return {
      interval: null,
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
    custodial() {
      return !this.user.account.pubkey;
    },
    cryptos() {
      let arr = [this.ticker === 'SAT' ? 'BTC' : 'SAT'];
      if (!this.user.accounts) return arr;
      arr = [
        ...new Set([
          ...arr,
          ...this.user.accounts.filter(a => !a.hide && a.pubkey === this.user.account.pubkey)
            .map(a => (a.ticker || a.asset.substr(0,3)))
        ]),
      ];

      if (this.ticker === 'BTC') arr.splice(arr.indexOf('BTC'), 1);
      return arr;
    },
    fiats() {
      return this.user.currencies.filter(c => c !== this.user.currency);
    },
    ...mapGetters(['rate', 'user']),
    ticker() {
      return this.isBtc ? this.user.unit : (this.user.account.ticker || this.user.account.asset.substr(0,3));
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
    precision() {
      if (this.user.unit === 'SAT') return 0;
      else return this.user.account.precision;
    },
    animatedRate() {
      return parseFloat(this.tweenedRate).toFixed(2);
    },
  },

  methods: {
    toggleCustodial() {
      let a = this.user.accounts.filter(a => a.asset === BTC);
      if (this.custodial) {
        this.shiftAccount(a.find(a => a.pubkey).id);
      } else {
        this.shiftAccount(a.find(a => !a.pubkey).id);
      }
    },
    shiftAccount: call('shiftAccount'),
    shiftCurrency: call('shiftCurrency'),
  },

  watch: {
    rate(newRate) {
      let t = 0;
      let oldRate = parseFloat(this.tweenedRate);
      let diff = oldRate - newRate;

      clearInterval(this.interval);
      this.interval = setInterval(() => {
        let delta = diff * ease(t / 100);
        this.tweenedRate = (oldRate - delta).toFixed(2);
        if (t > 100) clearInterval(this.interval);
        t++;
      }, 10);
    },
  },

  created() {
    this.tweenedRate = this.rate;
  },
};
</script>
