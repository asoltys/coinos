<template lang='pug'>
  v-card
    v-card-text
      v-progress-linear(v-if='loading' indeterminate='')
      v-form.mt-4(v-model='validForm' v-else='')
        h2.mb-4.white--text Register an Account
        v-text-field(label='Username' v-model='form.username' dark='' autocapitalize='none' ref='username' autocomplete='username' :rules='nameRules')
        v-text-field.validate(label='Email' type='email' v-model='form.email' dark='' autocapitalize='none' ref='email' autocomplete='email'  append-icon='$home' :rules='emailRules')
        v-text-field(label='SMS' @change='validatePhone()' v-model='form.sms' dark='' autocapitalize='none' ref='sms' append-icon='$cellphone' autocomplete='phone' :class='phoneValidated ? "validated" : "unvalidated"')
        v-text-field.validate(label='Password' v-model='form.password' type='password' ref='password' autocomplete='current-password' :rules='passwordRules' append-icon='$home')
        v-btn-toggle.d-flex.flex-wrap.mx-auto(tile='' color='primary accent-3' group='')
          v-btn.wide.mr-2.flex-grow-1(type='submit' :disabled='!validForm || !phoneValidated')
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

      // Validation Rules - may move to config file to reuse for similar forms (eg waiting list; reset password) (?)
      // Move validation styling below to css file
      
      nameRules: [
        v => !!v || 'Name is required',
        v => v && v.length >= 3 || 'Name must be at least 3 characters'
      ],

      emailRules: [
        v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
      ],

      // phone is auto-formatted and validated manually in validatePhone method below
      phoneRules: [
        v => !v || /^\+\d+ (\d\d\d) \d\d\d-\d\d\d\d$/.test(v) || 'Phone must be valid'
      ],

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
    async submit() {
      let user = await this.createUser(this.form);
      user.password = this.form.password;
      await this.login(user);
    },
    validatePhone () {
      this.phoneValidated = false
      this.phoneIcon = 'mdi-close'
      var digits = this.form.sms.replace(/\D/g, '')
      console.log(digits.length + ' validating phone ' + this.form.sms + ' -> ' + digits)
      var formatted
      if (digits.length === 11 && digits.substring(0,1) === '1') {
        formatted = '+1 (' + digits.substring(1,4) + ') ' + digits.substring(4, 7) + '-' + digits.substring(7,11)
      } else if (digits.length === 10) {
        formatted = '+1 (' +  digits.substring(0,3) + ' ' + digits.substring(3, 3) + '-' + digits.substring(6,4)
        this.$set(this.form, 'sms', formatted)
        this.phoneValidated = true
        this.phoneIcon = 'mdi-check'
        console.log('f: ' + formatted)
      } else if (digits.substring(0,1) === '+') {
        // International number
        formatted = this.form.sms
      }

      if (formatted) {
        console.log('f: ' + formatted)
        this.$set(this.form, 'sms', formatted)
        this.phoneValidated = true
        this.phoneIcon = '$check'
      } else {
        this.phoneValidated = false
        this.phoneIcon = '$cancel'
      }


}
  },

  mounted() {
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
