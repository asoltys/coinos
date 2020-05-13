<template>
  <div v-if="!initializing">
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
          <v-form @submit.prevent="submit" class="mt-4">
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
              @click="register"
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
import Water from 'vue-material-design-icons/Water';
import { sync } from 'vuex-pathify';

export default {
  components: { Flash, Login, Water },

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
      token: null,
    };
  },

  computed: {
    ...mapGetters(['error', 'user', 'initializing']),
    loading: sync('loading'),
    twofa: sync('twofa'),
  },

  methods: {
    ...mapActions(['login', 'createUser']),

    register() {
      this.loading = true;
      this.createUser(this.token);
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

    let _this = this;

    grecaptcha.ready(function() {
      grecaptcha.execute('6Ld1F_UUAAAAALyhgcusNcUZQFr6HD4iz6gQVTc0', {action: 'homepage'}).then(function(token) {
        _this.token = token;
      });
    });
  },
};
</script>

<style lang="stylus" scoped>
a
  text-decoration none

.v-text-field
  font-size 18px
</style>
