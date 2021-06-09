<template lang='pug'>
  v-card
    v-card-text
      v-progress-linear(v-if='loading' indeterminate='')
      v-form.mt-4(v-model='validForm' v-else='')
        h2.mb-4.white--text Register an Account
        v-text-field.validate(label='Username' v-model='form.username' dark='' autocapitalize='none' ref='username' autocomplete='username' :rules='nameRules' append-icon='$account')
        v-text-field.validate(label='Email' type='email' v-model='form.email' dark='' autocapitalize='none' ref='email' autocomplete='email'  append-icon='$email' :rules='rules.email')
        v-text-field(label='SMS (optional)' @change='validatePhone()' v-model='form.sms' dark='' autocapitalize='none' ref='sms' append-icon='$cellphone' autocomplete='phone' :rules='rules.NAPhone' :class='phoneValidated ? "validated" : "unvalidated"')
        v-text-field.validate(label='Password' v-model='form.password' type='password' ref='password' autocomplete='current-password' :rules='passwordRules' append-icon='$lock')
        v-btn-toggle.d-flex.flex-wrap.mx-auto(tile='' color='primary accent-3' group='')
          v-btn.wide.mr-2.flex-grow-1(@click='register()' :disabled='!validForm')
            v-icon(left='' color='green') $forward
            span Register
          v-btn.mb-1.mb-sm-0.wide.flex-grow-1(@click="$go('/')")
            v-icon(left='' color='red') $cancel
            span Nevermind
</template>

<script>
import { call, get, sync } from 'vuex-pathify';
const IS_PRODUCTION = !['development', 'test'].includes(process.env.NODE_ENV);
import config from '@/config'

export default {
  props: {
    username: { type: String, default: '' },
    password: { type: String, default: '' },
  },
  data() {
    return {
      validForm: false,
      submitted: false,
      form: {
        username: this.username,
        email: this.email,
        sms: this.sms,
        password: this.password,
        response: '',
        message: ''
      },
      phoneIcon: '$cancel',
      phoneValidated: false,
      rules: {},

      // Validation Rules - may move to config file to reuse for similar forms (eg waiting list; reset password) (?)
      // Move validation styling below to css file

      nameRules: [
        v => !!v || 'Name is required',
        v => v && v.length >= 3 || 'Name must be at least 3 characters'
      ],

      // emailRules: [
      //   v => !!v || 'Email is required',
      //   v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
      // ],

      // phone is auto-formatted and validated manually in validatePhone method below
      // phoneRules: [
      //   v => !v || /^\+1 \(\d\d\d\) \d\d\d\-\d\d\d\d$/.test(v) || 'Phone must be valid and include area code'
      // ],

      passwordRules: [
        v => !!v || 'Password is required',
        v => v && v.length >= 8 || 'Password must be at least 8 characters'
      ],
    };
  },

  computed: {
    error: sync('error'),
    loading: get('loading'),
  },

  methods: {
    createUser: call('createUser'),
    login: call('login'),
    async register() {
      let user = await this.createUser(this.form);
      user.password = this.form.password;
      console.log("User created...")
      await this.login(user);
      console.log("User logged in...")
    },
    validatePhone () {
      this.phoneValidated = false
      this.phoneIcon = 'mdi-close'
      var digits = this.form.sms.replace(/\D/g, '')
      console.log(digits.length + ' digits entered: ' + this.form.sms + ' -> ' + digits)
      var formattedPhone
      if (digits.length === 11 && digits.substring(0,1) === '1') {
        formattedPhone = '+1 (' + digits.substring(1,4) + ') ' + digits.substring(4, 7) + '-' + digits.substring(7,11)
      } else if (digits.length === 10) {
        formattedPhone = '+1 (' +  digits.substring(0,3) + ') ' + digits.substring(3, 6) + '-' + digits.substring(6,10)
        this.$set(this.form, 'sms', formattedPhone)
        this.phoneValidated = true
        this.phoneIcon = 'mdi-check'
        console.log('international format: ' + formattedPhone)
      } else if (digits.substring(0,1) === '+') {
        // International number
        formattedPhone = this.form.sms
        console.log('international format entered: ' + formattedPhone)
      }

      if (formattedPhone) {
        console.log('re-formatted: ' + formattedPhone)
        this.$set(this.form, 'sms', formattedPhone)
        this.phoneValidated = true
        this.phoneIcon = '$check'
        this.$set(this.form, 'formattedPhone', formattedPhone)
      } else {
        this.phoneValidated = false
        this.phoneIcon = '$cancel'
      }
    }
  },

  mounted() {

    this.rules = config.rules || {}

    if (!this.username) this.$refs.username.focus();
    else if (!this.password) this.$refs.password.focus();
  },
};
</script>
<style>
.v-text-field.validated .v-input__icon--append .v-icon { 
    color: green;
}
.v-text-field.unvalidated .v-input__icon--append .v-icon { 
    color: red;
}

.v-text-field.validate .v-input__icon--append .v-icon { 
    color: green;
}
.v-text-field.validate.error--text .v-input__icon--append .v-icon { 
    color: red;
}
</style>
