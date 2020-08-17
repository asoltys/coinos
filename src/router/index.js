import Vue from 'vue';
import VueRouter from 'vue-router';

const About = () =>
  import(
    /* webpackChunkName: "about" */
    '../components/About'
  );
const Accept = () =>
  import(
    /* webpackChunkName: "accept" */
    '../components/Accept'
  );
const Asset = () =>
  import(
    /* webpackChunkName: "asset" */
    '../components/Asset'
  );
const Decrypt = () =>
  import(
    /* webpackChunkName: "decrypt" */
    '../components/Decrypt'
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
const Redeem = () =>
  import(
    /* webpackChunkName: "redeem" */
    '../components/Redeem'
  );
const Register = () =>
  import(
    /* webpackChunkName: "register" */
    '../components/Register'
  );
const Scan = () =>
  import(
    /* webpackChunkName: "scan" */
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
const Sweep = () =>
  import(
    /* webpackChunkName: "sweep" */
    '../components/Sweep'
  );
const Text = () =>
  import(
    /* webpackChunkName: "text" */
    '../components/Text'
  );
const User = () =>
  import(
    /* webpackChunkName: "user" */
    '../components/User'
  );
const Pay = () =>
  import(
    /* webpackChunkName: "pay" */
    '../components/Pay'
  );
const Swap = () =>
  import(
    /* webpackChunkName: "swap" */
    '../components/Swap'
  );
const Swaps = () =>
  import(
    /* webpackChunkName: "swaps" */
    '../components/Swaps'
  );
const Wallets = () =>
  import(
    /* webpackChunkName: "wallets" */
    '../components/Wallets'
  );
const Withdraw = () =>
  import(
    /* webpackChunkName: "withdraw" */
    '../components/Withdraw'
  );

const routes = [
  { path: '/', component: Home, props: { logout: false } },
  { path: '/about', component: About },
  { name: 'accept', path: '/accept', component: Accept, props: true },
  { path: '/asset', component: Asset },
  { path: '/decrypt', component: Decrypt },
  { path: '/home', component: Home },
  { path: '/login', component: Login, props: { logout: false } },
  { path: '/logout', component: Login, props: { logout: true } },
  { path: '/payments', component: Payments },
  { path: '/receive', component: Receive },
  { path: '/redeem/:redeemcode', component: Redeem, props: true },
  { path: '/register', name:'register', component: Register, props: true },
  { path: '/scan', component: Scan },
  { name: 'send', path: '/send', component: Send, props: true },
  { path: '/settings', component: Settings },
  { path: '/sweep', component: Sweep },
  { path: '/text', component: Text },
  { path: '/pay', component: Pay },
  { path: '/propose', component: Swap },
  { path: '/swaps', component: Swaps },
  { path: '/wallets', component: Wallets },
  { path: '/withdraw', component: Withdraw },
  { path: '/:username', component: User, props: true },
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
