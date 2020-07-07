<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
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
        :error="form.confirm !== '' && form.confirm !== form.password"
      />

      <img :src="challenge" style="max-width: 100%" />
      <v-text-field
        label="Challenge Word"
        v-model="form.response"
        autocapitalize="none"
      />
      <v-btn type="submit" color="green" class="mr-2 mb-2 mb-sm-0 wide">
        <v-icon left>account_balance_wallet</v-icon>
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
      },
    };
  },

  computed: {
    challenge: get('challenge'),
    error: sync('error'),
    loading: get('loading'),
  },

  methods: {
    createUser: call('createUser'),
    getChallenge: call('getChallenge'),
    submit() {
      if (this.form.confirm === this.form.password) this.createUser(this.form);
    },
  },

  mounted() {
    this.getChallenge();
    this.$refs.username.focus();
  },
};
</script>
