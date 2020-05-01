const Coinos = {
  install(Vue, options) {
    Vue.prototype.$format = function(n, p) { 
      if (!p) p = this.user.account.precision;
      if (!parseInt(p) || this.user.unit === 'SAT') return parseInt(n).toFixed(0);
      else {
        let x = n / 10**p;
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split('e-')[1]);
    if (e) {
        x *= Math.pow(10,e-1);
        x = x.toFixed(1);
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
    },
    Vue.prototype.$go = function(path) { 
      this.$router.push(path).then().catch(() => {}) 
    };
  }
};

export default Coinos;
