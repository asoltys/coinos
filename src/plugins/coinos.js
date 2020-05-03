import format from "../format";

const Coinos = {
  install(Vue, options) {
    (Vue.prototype.$format = function(n, p) {
      if (p === undefined) p = this.user.unit === 'SAT' ? 0 : this.user.account.precision;
      return format(n, p);
    }),
      (Vue.prototype.$go = function(path) {
        this.$router
          .push(path)
          .then()
          .catch(() => {});
      });
  },
};

export default Coinos;
