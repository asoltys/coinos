import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/Home'
import About from '../components/About'
import Login from '../components/Login'
import Register from '../components/Register'
import Payments from '../components/Payments'
import Send from '../components/Send'
import Receive from '../components/Receive'
import Withdraw from '../components/Withdraw'
import Account from '../components/Account'
import Settings from '../components/Settings'

const routes = [
  { path: '/', component: Login, props: { logout: false } },
  { path: '/home', component: Home },
  { path: '/login', component: Login, props: { logout: false } },
  { path: '/register', component: Register },
  { path: '/payments', component: Payments },
  { path: '/send', component: Send },
  { path: '/receive', component: Receive },
  { path: '/withdraw', component: Withdraw },
  { path: '/account', component: Account },
  { path: '/settings', component: Settings },
  { path: '/about', component: About },
  { path: '/logout', component: Login, props: { logout: true } },
]

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'hash',
  routes: routes,
  scrollBehavior: function (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
})
