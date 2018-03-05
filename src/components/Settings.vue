<template lang="pug">
  form#setup(action='/users/id', method='post')
    h1 Settings
    |  
    input#username(type='hidden', name='username', value='username')
    |  
    input#email(type='hidden', name='email')
    .form-group
      label(for='title')
        | Store Name 
        small (optional)
        | :
      |  
      input#title.form-control(type='text', name='title')
    .form-group
      label(for='logo')
        | Logo 
        small (optional)
        | :
      |  
      input#logo.form-control(type='text', name='logo')
    .form-group
      label(for='currency') Currency:
      |  
      select#currency.form-control(name='currency')
    .form-group
      label(for='symbol') Exchange Rate:
      |  
      select#symbol.form-control(name='symbol')
    .form-group
      label(for='commission') Discount:
      |  
      select#commission.form-control(name='commission')
        option(value='0') None
        option(value='-1') 1%
        option(value='-2') 2%
        option(value='-3') 3%
        option(value='-4') 4%
        option(value='-5') 5%
        option(value='-10') 10%
        option(value='-15') 15%
        option(value='-20') 20%
        option(value='-25') 25%
        option(value='-50') 50%
    .form-group
      label(for='unit') Bitcoin Display Units:
      |  
      select#unit.form-control(name='unit')
    |  
    input.btn.btn-primary(type='submit', value='Done')
</template>

<script>
export default {
  name: 'Settings',
}
</script>
