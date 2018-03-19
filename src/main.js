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
    primary: '#000',
    secondary: '#eee',
    accent: '#000',
    success: '#000',
    error: '#000',
  },
})

if (navigator.userAgent.match(/Android/)) {
  var tag = document.createElement('script')
  tag.type = 'text/javascript'
  document.body.appendChild(tag)
  tag.src = 'cordova.js'

  document.addEventListener('deviceready', function () {
    Vue.prototype.$cordova = cordova
    document.getElementById('cancel').addEventListener('click', () => {
      window.QRScanner.cancelScan(status => { console.log(status) })
      document.querySelector('#wrapper').style.display = 'block'
      document.querySelector('#camcontrols').style.display = 'none'
      window.QRScanner.hide()
    })
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
