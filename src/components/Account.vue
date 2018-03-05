<template lang="pug">
  form#profile(action='/users/id', method='post')
    h1 Account Profile
    |  
    input#username.form-control(type='hidden', name='username', value='username')
    .form-group
      label(for='email') Email:
      |  
      input#email.form-control(type='text', name='email')
    .form-group
      label(for='phone') Phone:
      |  
      input#phone.form-control.bfh-phone(type='text', name='phone', data-format='+1 (ddd) ddd-dddd')
    .form-group
      label(for='password')
        | New Password 
        small (blank = no change)
        | :
      |  
      input#password.form-control(type='password', name='password')
    .form-group
      label(for='confirm') Confirm Password:
      |  
      input#confirm.form-control(type='password', name='confirm')
    br
    |  
    input.btn.btn-primary(type='submit', value='Done')
</template>

<script>
export default {
  name: 'Account',
}
</script>
