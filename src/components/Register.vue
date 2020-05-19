<template>
  <div>
    <v-progress-linear v-if="loading || initializing" indeterminate />
    <v-form v-else @submit.prevent="submit" class="mt-4">
      <h2>New Account</h2>
      <v-text-field
        label="Username"
        v-model="form.username"
        dark
        autocapitalize="none"
        ref="username"
      />
      <v-text-field label="Password" v-model="form.password" type="password" />
      <v-text-field
        label="Confirm Password"
        v-model="form.confirm"
        type="password"
      />

      <img :src="challenge" style="max-width: 100%" />
      <v-text-field label="Challenge Word" v-model="form.response" />
      <v-btn type="submit" color="green" class="mr-2 mb-2 mb-sm-0 wide">
        <v-icon class="mr-1">account_balance_wallet</v-icon>
        Register
      </v-btn>
    </v-form>
  </div>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';
const IS_PRODUCTION = !['development', 'test'].includes(process.env.NODE_ENV);

export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
        confirm: '',
        response: '',
        token: '',
      },
    };
  },

  computed: {
    challenge: get('challenge'),
    initializing: get('initializing'),
    loading: sync('loading'),
  },

  methods: {
    createUser: call('createUser'),
    getChallenge: call('getChallenge'),
    submit() {
      this.loading = true;
      this.createUser(this.form);
    },
  },

  mounted() {
    const s = document.createElement('script');
    s.setAttribute(
      'src',
      'https://www.google.com/recaptcha/api.js?render=6Ld1F_UUAAAAALyhgcusNcUZQFr6HD4iz6gQVTc0'
    );
    document.head.appendChild(s);

    let _this = this;

    if (IS_PRODUCTION) {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(process.env.VUE_APP_RECAPTCHA, {
            action: 'homepage',
          })
          .then(token => {
            _this.form.token = token;
          });
      });
    }

    this.getChallenge();
    this.$refs.username.focus();
  },
};
</script>
