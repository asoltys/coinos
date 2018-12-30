import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/Home'
import About from '../components/About'
import Login from '../components/Login'
import Register from '../components/Register'
import Payments from '../components/Payments'
import Send from '../components/Send'
import Receive from '../components/Receive'
import Buy from '../components/Buy'
import Network from '../components/Network'
import Market from '../components/Market'
import Contacts from '../components/Contacts'

const routes = [
  { path: '/', component: Login, props: { logout: false } },
  { path: '/home', component: Home },
  { path: '/login', component: Login, props: { logout: false } },
  { path: '/register', component: Register },
  { path: '/payments', component: Payments },
  { name: 'send', path: '/send', component: Send, props: true},
  { path: '/receive/:reset', component: Receive },
  { path: '/receive', component: Receive },
  { path: '/buy', component: Buy },
  { path: '/network', component: Network },
  { path: '/market', component: Market },
  { path: '/contacts', component: Contacts },
  { path: '/about', component: About },
  { path: '/logout', component: Login, props: { logout: true } },
]

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: routes,
  scrollBehavior: function (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
})
