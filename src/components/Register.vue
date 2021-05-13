<template lang='pug'>
  v-card
    v-card-text
      v-progress-linear(v-if='loading' indeterminate='')
      v-form.mt-4(v-else='')
        h2.mb-4.white--text Register an Account
        v-text-field(label='Username' v-model='form.username' dark='' autocapitalize='none' ref='username')
        v-text-field(label='Email' v-model='form.email' dark='' autocapitalize='none' ref='email')
        v-text-field(label='SMS' v-model='form.sms' dark='' autocapitalize='none' ref='sms')
        v-text-field(label='Password' v-model='form.password' type='password' ref='password')
        v-btn-toggle.d-flex.flex-wrap.mx-auto(tile='' color='primary accent-3' group='')
          v-btn.wide.mr-2.flex-grow-1(type='submit')
            v-icon(left='' color='green') $forward
            span Register
          v-btn.mb-1.mb-sm-0.wide.flex-grow-1(@click="$go('/')")
            v-icon(left='' color='red') $cancel
            span Nevermind

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
        email: this.email,
        sms: this.sms,
        password: this.password,
        response: '',
        message: ''
      }
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
    }
  },

  mounted() {
    if (!this.username) this.$refs.username.focus();
    else if (!this.password) this.$refs.password.focus();
  },
};
</script>
