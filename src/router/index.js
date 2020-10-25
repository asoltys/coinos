import Vue from 'vue';
import VueRouter from 'vue-router';
import goTo from 'vuetify/es5/services/goto';

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
const Funding = () =>
  import(
    /* webpackChunkName: "funding" */
    '../components/Funding'
  );
const Decrypt = () =>
  import(
    /* webpackChunkName: "decrypt" */
    '../components/Decrypt'
  );
const Faucet = () =>
  import(
    /* webpackChunkName: "faucet" */
    '../components/Faucet'
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
const Markets = () =>
  import(
    /* webpackChunkName: "markets" */
    '../components/Markets'
  );
const Wallet = () =>
  import(
    /* webpackChunkName: "wallet" */
    '../components/Wallet'
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
  { path: '/funding', component: Funding },
  { name: 'accept', path: '/accept', component: Accept, props: true },
  { path: '/asset', component: Asset },
  { path: '/decrypt', component: Decrypt },
  { name: 'faucet', path: '/faucet', component: Faucet, props: true },
  { path: '/faucet/:asset', component: Faucet, props: true },
  { path: '/home', component: Home },
  { name: 'login', path: '/login/:jwt', component: Login, props: true },
  { path: '/login', component: Login, props: { logout: false } },
  { path: '/logout', component: Login, props: { logout: true } },
  { path: '/markets', component: Markets },
  { name: 'markets', path: '/markets/:t1-:t2', component: Markets, props: true },
  { path: '/payments', component: Payments },
  { path: '/receive', component: Receive },
  { path: '/redeem/:redeemcode', component: Redeem, props: true },
  { path: '/register', name: 'register', component: Register, props: true },
  { path: '/scan', component: Scan },
  { name: 'send', path: '/send', component: Send, props: true },
  { path: '/settings', component: Settings },
  { path: '/sweep', component: Sweep },
  { path: '/text', component: Text },
  { path: '/pay', component: Pay },
  { path: '/propose', component: Swap },
  { path: '/wallet', component: Wallet },
  { path: '/wallets', component: Wallets },
  { path: '/withdraw', component: Withdraw },
  { path: '/:username', component: User, props: true },
];

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  routes: routes,
  scrollBehavior: (to, from, savedPosition) => {
    let scrollTo = 0;

    if (to.hash) {
      scrollTo = to.hash;
    } else if (savedPosition) {
      scrollTo = savedPosition.y;
    }

    return goTo(scrollTo);
  },
});
