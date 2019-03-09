<template lang="pug">
div
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
