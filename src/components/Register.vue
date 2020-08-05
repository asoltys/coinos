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

        <div class="d-flex flex-wrap">
      <label class="my-auto mr-2">Challenge Word:</label>
      <img :src="challenge" style="max-width: 100%" />
      </div>
      <v-text-field
        label="Enter Challenge Word"
        v-model="form.response"
        autocapitalize="none"
      />
    <v-btn @click="$go('/')" class="mr-1">
      <v-icon left>$arrow_back</v-icon>
      Back
    </v-btn>
      <v-btn type="submit" color="green" class="wide">
        <v-icon left>$wallet</v-icon>
        Create New Account
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
