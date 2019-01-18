<template lang="pug">
v-layout
  v-flex(xs12)
    v-form(@submit='submit')
      v-card
        v-card-text
          v-text-field(label='Email' v-model='email' type='text')
            template(slot='append')
              span.yellow--text
                v-icon(color='yellow').mr-1 warning
                span Not Verified
          v-text-field(label='Phone' v-model='phone' type='text' mask='phone')
            template(slot='append')
              span.yellow--text
                v-icon(color='yellow').mr-1 warning
                span Not Verified
          v-switch(label='Two-Factor Authentication "2FA"' v-model='twofa')
          v-card(color='#333' v-show='twofa').elevation-4
            v-card-text
              div.mx-auto.text-xs-center
                v-layout(align-center)
                  v-flex(xs6)
                    canvas#qr
                  v-flex(xs6)
                    P
                      code.black--text.ml-2 13098v0n1981098123
                    p Scan this QR code or enter the above key into your Google Authenticator or Authy app
              v-text-field(label='Six digit code' v-model='auth' type='text' mask='######')
          v-layout(align-center)
            v-checkbox(label='Email Notifications')
            v-checkbox(label='Text Notifications')
          v-btn Save Settings
      v-divider.my-2
      v-layout
        v-flex(xs6)
          v-card
            v-card-text
              v-text-field(label='New Password' v-model='password' type='password')
              v-text-field(label='Confirm Password' v-model='passconfirm' type='password')
              v-btn(type='submit') Change Password
        v-flex(xs6).ml-2
          v-card
            v-card-text
              v-text-field(label='New Withdrawal Pin' v-model='pin' type='pin')
              v-text-field(label='Confirm Withdrawal Pin' v-model='pinconfirm' type='pin')
              v-btn(type='submit') Change Pin
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import qr from 'qrcode'

export default {
  data () {
    return {
      email: '',
      password: '',
      passconfirm: '',
      notify: 'Email',
      twofa: false,
    }
  },

  computed: mapGetters(['user']),

  methods: {
    submit (e) {
      e.preventDefault()
      this.updateUser(this.form)
    },

    drawQR () {
      // if (!this.user.authtoken) return
      let canvas = document.querySelector('#qr')
      qr.toCanvas(canvas, 'authtoken', e => { if (e) console.log(e) })
      canvas.style.width = '25vh'
      canvas.style.height = '25vh'
      canvas.style.cursor = 'pointer'
    },

    ...mapActions(['updateUser']),
  },

  mounted () {
    this.email = this.user.email
    this.drawQR()
  },
}
</script>
