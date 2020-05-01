<script>
import { call } from 'vuex-pathify';
const SATS = 100000000;
const trimZeros = s => s.replace(/[0]+$/, '').replace(/[.]$/, '');

export default {
  methods: {
    toggleUnit: call('toggleUnit'),
    btc(n, precision) {
      if (!precision) precision = this.user.account.precision;
      if (!parseInt(precision) || this.user.unit === 'SAT') return parseInt(n).toFixed(0);
      else return (n / 10**precision).toFixed(precision);
    },
  },
};
</script>
