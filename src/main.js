import Vue from 'vue'
import Vuetify from 'vuetify'
import VueAxios from 'vue-axios'
import Axios from 'axios'
import App from './App'
import router from './router'
import store from './store'
import 'mdi/css/materialdesignicons.min.css'

Axios.defaults.baseURL = process.env.BASEURL

Vue.use(VueAxios, Axios)
Vue.use(Vuetify, {
  theme: {
    primary: '#ff0',
    secondary: '#333',
    accent: '#ff0',
    error: '#b71c1c',
  },
})

if (process.env.NODE_ENV === 'production') {
  document.addEventListener('deviceready', function () {
    Vue.prototype.$cordova = cordova
  }, false)

  var tag = document.createElement('script')
  tag.type = 'text/javascript'
  document.body.appendChild(tag)
  tag.src = 'cordova.js'
}

/* eslint-disable no-new */
new Vue({
  components: { App },
  el: '#app',
  template: '<app/>',
  router,
  store,
})
