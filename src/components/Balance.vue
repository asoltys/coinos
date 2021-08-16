<template>
  <div v-if="user.id && user.account" class="mb-2 text-center no-print">
    <div class="d-flex">
      <div class="display-2 font-weight-black flex-grow-1 text-right mr-2" style="word-break: break-all">
        {{ $format(user.account.balance, precision) }}
      </div>
      <div class="text-left flex-grow-1 my-auto">
        <currency-list :currency="ticker" :currencies="cryptos" type="accounts" />
      </div>
    </div>
    <h3
      v-if="!isNaN(animatedRate) && isBtc"
      class="d-flex flex-wrap justify-center"
    >
      <div class="fiat primary--text display-1 my-auto">{{ fiat | format_fiat }}</div>
      <div class="mx-1">
        <currency-list :currency="user.currency" :currencies="fiats" />
      </div>
      <div class="mt-auto mb-1">
        <span>
          @
          <span class="font-weight-black primary--text">{{
            adjustedAnimatedRateText
          }}</span>
          / {{ this.user.unit }}
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
        minimumFractionDigits: 0,
        maximumFractionDigits: 12,
      });
    },
    format_fiat(n) {
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
      let arr = ['SAT', 'KSAT', 'MSAT', 'BTC', 'GSAT', 'TSAT'];
      arr.splice(arr.indexOf(this.ticker), 1);
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
      else if (this.user.unit === 'KSAT') return 3;
      else if (this.user.unit === 'MSAT') return 6;
      else if (this.user.unit === 'BTC') return 8;
      else if (this.user.unit === 'GSAT') return 9;
      else if (this.user.unit === 'TSAT') return 12;
      else return this.user.account.precision;
    },
    animatedRate() {
      return parseFloat(this.tweenedRate);
    },
    adjustedAnimatedRate() {
      return parseFloat(this.tweenedRate) * Math.pow(10, this.precision - 8);
    },
    adjustedAnimatedRateText() {
      let decimalDigits = 10 - this.precision;
      if (decimalDigits < 2) decimalDigits = 2;

      return parseFloat(this.adjustedAnimatedRate).toLocaleString('en-US', {
        minimumFractionDigits: decimalDigits,
        maximumFractionDigits: decimalDigits,
      });
    }
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
