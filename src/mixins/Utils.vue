<script>
import { call } from 'vuex-pathify';
const SATS = 100000000;
const trimZeros = s => s.replace(/[0]+$/, '').replace(/[.]$/, '');

export default {
  methods: {
    toggleUnit: call('toggleUnit'),
    btc(n) {
      if (this.user.unit === 'SAT') return parseInt(n).toFixed(0);
      else return trimZeros((n / SATS).toFixed(8))
    },
  },
};
</script>
