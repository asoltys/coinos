<template lang="pug">
v-layout
  v-flex(xs12)
    v-alert.black--text.mb-4(color='yellow' icon='info' v-model='verifyingEmail' dismissible transition='scale-transition') An email has been sent with a link for you to click on
    v-form(@submit='submit')
      v-card
        v-card-text
          v-layout
            v-text-field(label='Email' v-model='form.email' type='text')
              template(slot='append')
                span(v-if='user.emailVerified && form.email === user.email').green--text
                  v-icon(color='green').mr-1 info
                  span Verified
                span(v-else-if='validate(form.email)').yellow--text
                  v-icon(color='yellow').mr-1 warning
                  span Not Verified
                span(v-else).red--text
                  v-icon(color='red').mr-1 error
                  span Not Valid
            v-btn(v-if='(form.email != user.email || !user.emailVerified) && validate(form.email)' @click='challengeEmail') Verify
          v-layout
            v-text-field(label='Phone' v-model='form.phone' type='text' mask='phone' @change='updatePhone')
              template(slot='append')
                span(v-if='user.phoneVerified && user.phoneVerified !== "0" && form.phone === user.phone').green--text
                  v-icon(color='green').mr-1 info
                  span Verified
                span(v-else-if='form.phone.length === 10').yellow--text
                  v-icon(color='yellow').mr-1 warning
                  span Not Verified
                span(v-else).red--text
                  v-icon(color='red').mr-1 error
                  span Not Valid
            v-btn(v-if='form.phone.length === 10 && (!user.phoneVerified || user.phoneVerified === "0")' @click='challengePhone') Verify
          v-layout
            v-alert.black--text.mb-4(v-if='!user.phoneVerified' color='yellow' icon='info' v-model='verifyingPhone' dismissible transition='scale-transition') A 6 digit code will be texted to your phone. Enter it below:
          v-layout(v-if='verifyingPhone && form.phone.length === 10 && !(user.phoneVerified && user.phone === form.phone)')
            v-text-field(label='Code' v-model='form.phoneCode' ref='phoneCode' type='text' @keyup='checkCode')
          v-switch(:label='`Two-Factor Authentication "2FA" ${user.phoneVerified ? "" : "(Requires Verified Phone Number)"}`' v-model='form.twofa' :disabled='!user.phoneVerified')
          v-btn(@click='save') Save Settings
      v-divider.my-2
      v-layout
        v-flex(xs6)
          v-card
            v-card-text
              v-text-field(label='New Password' v-model='form.password' type='password')
              v-text-field(label='Confirm Password' v-model='form.passconfirm' type='password')
              v-btn(type='submit') Change Password
        v-flex(xs6).ml-2
          v-card
            v-card-text
              v-text-field(label='New Withdrawal Pin' v-model='form.pin' type='pin')
              v-text-field(label='Confirm Withdrawal Pin' v-model='form.pinconfirm' type='pin')
              v-btn(type='submit') Change Pin
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import validator from 'email-validator'

export default {
  data () {
    return {
      form: {
        email: '',
        password: '',
        passconfirm: '',
        phone: '',
        phoneCode: '',
        pin: '',
        pinconfirm: '',
        notify: 'Email',
        twofa: false,
      },
      verifyingEmail: false,
      verifyingPhone: false,
    }
  },

  computed: mapGetters(['user']),

  methods: {
    updatePhone () {
      this.form.phoneCode = ''
    },

    save () {
      this.submit()
      this.$router.push('/home')
    },

    checkCode () {
      if (this.form.phoneCode.length === 6)
        this.verifyPhone({ username: this.form.username, token: this.form.phoneCode })
    },

    validate (email) {
      return validator.validate(email)
    },

    challengeEmail () {
      this.verifyingEmail = true
      this.submit()
      this.requestEmail(this.form.email)
    }, 

    challengePhone () {
      this.verifyingPhone = true
      this.submit()
      this.requestPhone(this.form.phone)
      this.$nextTick(() => this.$refs.phoneCode.focus())
    }, 

    submit (e) {
      if (e) e.preventDefault()
      this.updateUser(this.form)
    },

    ...mapActions(['updateUser', 'requestEmail', 'requestPhone', 'verifyPhone']),
  },

  mounted () {
    Object.assign(this.form, this.user)
  },
}
</script>
