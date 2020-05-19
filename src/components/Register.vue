<template>
  <div>
    <v-progress-linear v-if="submitted" indeterminate />
    <v-form v-show="!submitted" v-else @submit.prevent="submit" class="mt-4">
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
        :error="form.confirm !== '' && form.confirm !== form.password"
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
      submitted: false,
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
    error: get('error'),
  },

  methods: {
    createUser: call('createUser'),
    getChallenge: call('getChallenge'),
    submit() {
      this.submitted = true;
      if (this.form.confirm === this.form.password) this.createUser(this.form);
    },
    captcha() {
      let _this = this;
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(process.env.VUE_APP_RECAPTCHA, {
              action: 'homepage',
            })
            .then(token => {
              _this.form.token = token;
            });
        });
      } else {
        setTimeout(this.captcha, 1000);
      }
    },
  },

  watch: {
    error(v) {
      this.submitted = false;
    } 
  },

  mounted() {
    if (IS_PRODUCTION) {
      const s = document.createElement('script');
      s.setAttribute(
        'src',
        'https://www.google.com/recaptcha/api.js?render=6Ld1F_UUAAAAALyhgcusNcUZQFr6HD4iz6gQVTc0'
      );
      document.head.appendChild(s);
      this.captcha();
    }

    this.getChallenge();
    this.$refs.username.focus();
  },
};
</script>
