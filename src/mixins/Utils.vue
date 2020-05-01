<script>
import { call } from 'vuex-pathify';
const SATS = 100000000;

function toFixed(x) {
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split('e-')[1]);
    if (e) {
        x *= Math.pow(10,e-1);
        x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
        e -= 20;
        x /= Math.pow(10,e);
        x += (new Array(e+1)).join('0');
    }
  }
  return x;
}

export default {
  methods: {
    toggleUnit: call('toggleUnit'),
    btc(n, precision) {
      if (!precision) precision = this.user.account.precision;
      if (!parseInt(precision) || this.user.unit === 'SAT') return parseInt(n).toFixed(0);
      else return toFixed(n / 10**precision);

    },
  },
};
</script>
