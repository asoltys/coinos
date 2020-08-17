import format from '../format';
import { networks } from 'bitcoinjs-lib';
import { networks as lqnetworks } from 'liquidjs-lib';

const Coinos = {
  install(Vue, options) {
    (Vue.prototype.$format = function(n, p) {
      if (p === undefined)
        p = this.user.unit === 'SAT' ? 0 : this.user.account.precision;
      return format(n, p);
    }),
      (Vue.prototype.$go = function(path) {
        this.$router
          .push(path)
          .then()
          .catch(() => {});
      }),
      (Vue.prototype.$network =
        process.env.NODE_ENV === 'production'
          ? networks['bitcoin']
          : networks['regtest']),
      (Vue.prototype.$prod = process.env.NODE_ENV === 'production'),
      (Vue.prototype.$lqnetwork =
        process.env.NODE_ENV === 'production'
          ? lqnetworks['liquid']
          : lqnetworks['regtest']),
      (Vue.prototype.$prod = process.env.NODE_ENV === 'production');
  },
};

export default Coinos;
