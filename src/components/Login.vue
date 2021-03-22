<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <div v-else>
      <div class="text-center">
        <h2>
          Send and receive
          <a href="https://bitcoin.org/" class="primary--text">bitcoin</a>
        </h2>
        <p style="display: inline-flex" class="mb-0">
          with <v-icon color="liquid" class="mx-1">$liquid</v-icon>
          <a href="https://blockstream.com/liquid/" class="liquid--text"
            >Liquid</a
          >
          <span class="ml-1">and</span>
          <v-icon color="primary">$flash</v-icon>
          <a href="http://lightning.network/">Lightning</a>
        </p>
      </div>
      <div class="text-center d-flex flex-wrap justify-center"></div>
      <v-divider class="my-2" />
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


    <v-btn-toggle tile color="primary accent-3" group class="d-flex flex-wrap mx-auto">
            <v-btn class="mr-2 mb-2 mb-sm-0 wide flex-grow-1" type="submit">
              <v-icon left color="primary">$login</v-icon>
              Sign in
            </v-btn>
            <v-btn @click="anon" class="mr-2 mb-2 mb-sm-0 wide flex-grow-1">
              <v-icon left color="blue">$account</v-icon>
              Use Anonymously
            </v-btn>
            <v-btn @click="register" class="mr-2 mb-2 mb-sm-0 wide flex-grow-1">
              <v-icon left color="green">$wallet</v-icon>
              Register An Account
            </v-btn>
            <v-btn @click="lnurlAuth" class="mr-2 mb-2 mb-sm-0 wide flex-grow-1">
              <v-icon left>$qrcode</v-icon>
              Sign in with LNURL
            </v-btn>
            </v-btn-toggle>
          </v-form>
        </v-card-text>
      </v-card>
      <v-btn v-if="lnurl" @click="lnurl = null" class="mt-2">
        <v-icon left>$left</v-icon>
        Back
      </v-btn>
    </div>
  </div>
</template>

<script>
import Lnurl from './Lnurl';
import { v4 } from 'uuid';
import { get, call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';

export default {
  components: { Lnurl },
  mixins: [Copy],

  props: {
    jwt: {
      type: String,
      default: null,
    },
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
    snack: call('snack'),
    createUser: call('createUser'),
    async anon() {
      let user = {
        username: `satoshi-${v4().substr(0, 8)}`,
        password: 'password',
        confirm: 'password',
      };
      user = await this.createUser(user);
      user.password = 'password';
      this.login(user);
      this.snack(`Welcome ${user.username}! Your password is 'password'`);
    },
    register() {
      const { username, password } = this.form;
      this.$go({ name: 'register', params: { username, password } });
    },
    login: call('login'),
    init: call('init'),
    lnurlAuth: call('lnurlAuth'),
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
    if (this.jwt) {
      this.token = this.jwt;
      this.$go('/home');
    }
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
