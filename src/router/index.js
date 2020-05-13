import Vue from 'vue';
import VueRouter from 'vue-router';

const About = () =>
  import(
    /* webpackChunkName: "about" */
    '../components/About'
  );
const Assets = () =>
  import(
    /* webpackChunkName: "assets" */
    '../components/Assets'
  );
const Home = () =>
  import(
    /* webpackChunkName: "home" */
    '../components/Home'
  );
const Login = () =>
  import(
    /* webpackChunkName: "login" */
    '../components/Login'
  );
const Payments = () =>
  import(
    /* webpackChunkName: "payments" */
    '../components/Payments'
  );
const Receive = () =>
  import(
    /* webpackChunkName: "receive" */
    '../components/Receive'
  );
const Scan = () =>
  import(
    /* webpackChunkName: "send" */
    '../components/Scan'
  );
const Send = () =>
  import(
    /* webpackChunkName: "send" */
    '../components/Send'
  );
const Settings = () =>
  import(
    /* webpackChunkName: "settings" */
    '../components/Settings'
  );
const Text = () =>
  import(
    /* webpackChunkName: "text" */
    '../components/Text'
  );

const routes = [
  { path: '/', component: Login, props: { logout: false } },
  { path: '/about', component: About },
  { path: '/assets', component: Assets },
  { path: '/home', component: Home },
  { path: '/login', component: Login, props: { logout: false } },
  { path: '/logout', component: Login, props: { logout: true } },
  { path: '/payments', component: Payments },
  { path: '/receive', component: Receive },
  { path: '/receive', component: Receive },
  { path: '/scan', component: Scan },
  { name: 'send', path: '/send', component: Send, props: true },
  { path: '/settings', component: Settings },
  { path: '/text', component: Text },
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
