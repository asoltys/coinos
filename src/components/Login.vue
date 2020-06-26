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
          <div v-if="result">
            <qr :text="result.encoded" />
            <v-textarea
              v-if="result.encoded"
              label="LNURL"
              :value="result.encoded"
              rows="1"
              auto-grow
              readonly
            >
              <template v-slot:append>
                <v-btn @click="() => copy(result.encoded)" icon class="ml-1">
                  <v-icon class="mr-1">content_copy</v-icon>
                </v-btn>
              </template>
            </v-textarea>
          </div>
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
              @click="lnurl"
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
            >
              <v-icon class="mr-1">account_balance_wallet</v-icon>
              New Account
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
      <div class="text-center my-2 d-flex flex-wrap justify-center"></div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Flash from 'vue-material-design-icons/Flash';
import Login from 'vue-material-design-icons/Login';
import Qrcode from 'vue-material-design-icons/Qrcode';
import Qr from './Qr';
import Water from 'vue-material-design-icons/Water';
import { get, call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';

export default {
  components: { Flash, Login, Water, Qr, Qrcode },
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
      result: null,
    };
  },

  computed: {
    ...mapGetters(['error', 'user', 'initializing']),
    loading: sync('loading'),
    twofa: sync('twofa'),
    token: sync('token'),
  },

  methods: {
    ...mapActions(['login']),
    init: call('init'),
    getLoginUrl: call('getLoginUrl'),
    async lnurl() {
      try {
        this.result = await this.getLoginUrl();
      } catch(e) {
        return console.log('problem getting login url', e);
      } 

      try {
        const proto =
          process.env.NODE_ENV === 'production' ? 'wss://' : 'ws://';
        let ws = new WebSocket(`${proto}${location.host}/ws`);
        ws.onmessage = msg => {
          let { type, data } = JSON.parse(msg.data);

          switch (type) {
            case 'connected':
              ws.send(
                JSON.stringify({ type: 'lnurl', data: this.result.secret })
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
