import Vue from 'vue'
import Vuetify from 'vuetify'
import VueAxios from 'vue-axios'
import Axios from 'axios'
import App from './App'
import CamControls from './CamControls'
import router from './router'
import store from './store'
import './main.styl'

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

if (navigator.userAgent.match(/Android/)) {
  var tag = document.createElement('script')
  tag.type = 'text/javascript'
  document.body.appendChild(tag)
  tag.src = 'cordova.js'

  document.addEventListener('deviceready', function () {
    Vue.prototype.$cordova = cordova
  }, false)
}

/* eslint-disable no-new */
new Vue({
  components: { App },
  el: '#app',
  template: '<app/>',
  router,
  store,
})

new Vue({
  components: { CamControls },
  el: '#camcontrols',
  template: '<cam-controls/>',
})
