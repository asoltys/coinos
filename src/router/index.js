import Vue from 'vue';
import VueRouter from 'vue-router';
const Home = () => import('../components/Home');
const About = () => import('../components/About');
const Assets = () => import('../components/Assets');
const Login = () => import('../components/Login');
const Payments = () => import('../components/Payments');
const Send = () => import('../components/Send');
const Receive = () => import('../components/Receive');
const Settings = () => import('../components/Settings');
const Text = () => import('../components/Text');

const routes = [
  { path: '/', component: Login, props: { logout: false } },
  { path: '/home', component: Home },
  { path: '/login', component: Login, props: { logout: false } },
  { path: '/payments', component: Payments },
  { name: 'send', path: '/send', component: Send, props: true },
  { path: '/receive', component: Receive },
  { path: '/receive', component: Receive },
  { path: '/about', component: About },
  { path: '/assets', component: Assets },
  { path: '/settings', component: Settings },
  { path: '/text', component: Text },
  { path: '/logout', component: Login, props: { logout: true } },
];

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  routes: routes,
  scrollBehavior: function(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
});
