<template>
  <v-card>
    <v-card-text>
      <v-progress-linear v-if="loading" indeterminate />
      <v-form v-else @submit.prevent="submit" class="mt-4">
        <h2 class="mb-4 white--text">Register an Account</h2>
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
          ref="password"
        />
        <v-btn-toggle
          tile
          color="primary accent-3"
          group
          class="d-flex flex-wrap mx-auto"
        >
          <v-btn type="submit" class="wide mr-2 flex-grow-1">
            <v-icon left color="green">$forward</v-icon>
            Register
          </v-btn>
          <v-btn @click="$go('/')" class="mb-1 mb-sm-0 wide flex-grow-1">
            <v-icon left color="red">$cancel</v-icon>
            Nevermind
          </v-btn>
        </v-btn-toggle>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';
const IS_PRODUCTION = !['development', 'test'].includes(process.env.NODE_ENV);

export default {
  props: {
    username: { type: String, default: '' },
    password: { type: String, default: '' },
  },
  data() {
    return {
      submitted: false,
      form: {
        username: this.username,
        password: this.password,
        response: '',
      },
    };
  },

  computed: {
    error: sync('error'),
    loading: get('loading'),
  },

  methods: {
    createUser: call('createUser'),
    login: call('login'),
    async submit() {
      let user = await this.createUser(this.form);
      user.password = this.form.password;
      await this.login(user);
    },
  },

  mounted() {
    if (!this.username) this.$refs.username.focus();
    else if (!this.password) this.$refs.password.focus();
  },
};
</script>
