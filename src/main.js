import Vue from 'vue';
import VueAxios from 'vue-axios';
import VueMeta from 'vue-meta'
import Axios from 'axios';
import App from './App';
import router from './router';
import store from './store';
import FastClick from 'fastclick';
import coinos from './plugins/coinos';
import vuetify from './plugins/vuetify';

Axios.defaults.baseURL = '/api';

Vue.use(VueAxios, Axios);
Vue.use(coinos);
Vue.use(VueMeta, { keyName: 'head' })

const app = new Vue({
  render: h => h(App),
  router,
  vuetify,
  store,
}).$mount('#app');

if ('addEventListener' in document) {
  document.addEventListener(
    'DOMContentLoaded',
    async function() {
      FastClick.attach(document.body);
    },
    false
  );
}
