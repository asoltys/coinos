<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <div v-else>
      <div class="text-center">
        <h2>
          Send and receive
          <a href="https://bitcoin.org/" class="yellow--text">bitcoin</a>
        </h2>
        <p style="display: inline-flex" class="mb-0">
          with <water fillColor="#06ddff" :size="24" />
          <a href="https://blockstream.com/liquid/" style="color: #06ddff"
            >Liquid</a
          >
          <span class="ml-1">and</span>
          <flash fillColor="yellow" :size="24" />
          <a href="http://lightning.network/">Lightning</a>
        </p>
      </div>
      <div class="text-center d-flex flex-wrap justify-center"></div>
      <v-divider class="mb-2" />
      <v-card>
        <v-card-text>
          <lnurl v-if="lnurl" :lnurl="lnurl" />
          <v-form v-else @submit.prevent="submit" class="mt-4">
            <v-text-field
              label="Username"
              v-model="form.username"
              dark
              autocapitalize="none"
              ref="username"
            />
            <v-text-field
              label="Password"
              v-model="form.password"
              type="password"
            />
            <v-btn
              color="secondary"
              class="mr-2 mb-2 mb-sm-0 wide"
              type="submit"
            >
              <login class="mr-1" />
              Sign in
            </v-btn>
            <v-btn
              @click="lnurlAuth"
              color="secondary"
              class="mr-2 mb-2 mb-sm-0 wide"
            >
              <qrcode class="mr-1" />
              LNURL Auth
            </v-btn>
            <v-btn
              @click="$go('/register')"
              color="green"
              class="mr-2 mb-2 mb-sm-0 wide"
              :disabled="form.username.length > 1 || form.password.length > 1"
            >
              <v-icon left>$wallet</v-icon>
              New Account
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    <v-btn @click="$go('/swaps')" class="mt-2 mr-1">
      <v-icon left>$swap</v-icon>
      View Swap Proposals
    </v-btn>
    <v-btn v-if="lnurl" @click="lnurl = null" class="mt-2">
      <v-icon left>$arrow_back</v-icon>
      Back
    </v-btn>
    </div>
  </div>
</template>

<script>
import Flash from 'vue-material-design-icons/Flash';
import Login from 'vue-material-design-icons/Login';
import Qrcode from 'vue-material-design-icons/Qrcode';
import Lnurl from './Lnurl';
import Water from 'vue-material-design-icons/Water';
import { get, call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';

export default {
  components: { Flash, Login, Water, Qrcode, Lnurl },
  mixins: [Copy],

  props: {
    logout: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      loggingIn: false,
      form: {
        username: '',
        password: '',
      },
    };
  },

  computed: {
    error: get('error'),
    initializing: get('initializing'),
    lnurl: sync('lnurl'),
    loading: sync('loading'),
    token: sync('token'),
    twofa: sync('twofa'),
    user: get('user'),
  },

  methods: {
    login: call('login'),
    init: call('init'),
    getLoginUrl: call('getLoginUrl'),
    async lnurlAuth() {
      try {
        await this.getLoginUrl();

        this.$nextTick(() => {
          try {
            const proto =
              process.env.NODE_ENV === 'production' ? 'wss://' : 'ws://';
            let ws = new WebSocket(`${proto}${location.host}/ws`);
            ws.onmessage = msg => {
              let { type, data } = JSON.parse(msg.data);

              switch (type) {
                case 'connected':
                  ws.send(
                    JSON.stringify({ type: 'lnurl', data: this.lnurl.secret })
                  );
                  break;

                case 'token':
                  this.token = data;
                  ws.close();
                  this.$go('/home');
                  break;
              }
            };
          } catch (e) {
            console.log('socket error', e);
          }
        });
      } catch (e) {
        return console.log('problem getting login url', e);
      }
    },
    submit(e) {
      this.login(this.form);
    },
  },

  created() {
    if (this.logout) {
      this.$store.dispatch('logout');
    }
  },

  mounted() {
    if (window.innerWidth > 600 && this.$refs.username) {
      this.$refs.username.focus();
    }
  },
};
</script>

<style lang="stylus" scoped>
a
  text-decoration none

.v-text-field
  font-size 18px
</style>
