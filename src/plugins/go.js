const Go = {
  install(Vue, options) {
    Vue.prototype.$go = function(path) { 
      this.$router.push(path).then().catch(() => {}) 
    };
  }
};

export default Go;
