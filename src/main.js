import Vue from 'vue';
import VueAxios from 'vue-axios';
import Axios from 'axios';
import App from './App';
import CamControls from './CamControls';
import router from './router';
import store from './store';
import FastClick from 'fastclick';
import { createProvider } from './vue-apollo';
import vuetify from './plugins/vuetify';

Axios.defaults.baseURL = process.env.VUE_APP_BASEURL;

Vue.use(VueAxios, Axios);

const app = new Vue({
  render: h => h(App),
  router,
  apolloProvider: createProvider(),
  vuetify,
  store,
}).$mount('#app');

new Vue({
  render: h => h(CamControls),
  store,
}).$mount('#camcontrols');

if ('addEventListener' in document) {
  document.addEventListener(
    'DOMContentLoaded',
    function() {
      FastClick.attach(document.body);
    },
    false
  );
}

if (/iPad|iPhone|iPod|Android/.test(navigator.userAgent)) {
  var tag = document.createElement('script');
  tag.type = 'text/javascript';
  document.body.appendChild(tag);
  tag.src = 'cordova.js';

  document.addEventListener(
    'deviceready',
    function() {
      Vue.prototype.$cordova = cordova;
      app.$router.push('/login');
    },
    false
  );
}
