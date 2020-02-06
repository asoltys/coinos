import Vue from 'vue';
import VueAxios from 'vue-axios';
import Axios from 'axios';
import App from './App';
import router from './router';
import store from './store';
import FastClick from 'fastclick';
import FBSignInButton from 'vue-facebook-signin-button';
import vuetify from './plugins/vuetify';

Axios.defaults.baseURL = process.env.VUE_APP_BASEURL;

Vue.use(FBSignInButton);
Vue.use(VueAxios, Axios);

const app = new Vue({
  render: h => h(App),
  router,
  vuetify,
  store,
}).$mount('#app');

if (window.location.protocol !== 'file:') {
  window.fbAsyncInit = function() {
    window.FB.init({
      appId: process.env.VUE_APP_FACEBOOK,
      cookie: false,
      xfbml: true,
      version: 'v5.0',
    });
  };
  (function(d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
  })(document, 'script', 'facebook-jssdk');
}

if ('addEventListener' in document) {
  document.addEventListener(
    'DOMContentLoaded',
    function() {
      FastClick.attach(document.body);
    },
    false
  );
}
