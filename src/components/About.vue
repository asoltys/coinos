<template lang="pug">
div
  v-card
    v-card-text
      p CoinOS is a lightning enabled Bitcoin wallet and point of sale app that you can use to send and receive payments
      p The app is free to use and the source code is available on #[a(href="https://github.com/asoltys/coinos.io") Github] in case you want to host your own copy or help make it better
      img(src='static/img/sausage.svg' style="width: 300px")
      p This wallet is still under development. Funds are held in custody on the server at this time which means that if we get hacked, turn evil, or if the code has bugs, you'll lose your money.
      p Minimal security measures are in place right now so please don't deposit more than pocket change that you're willing to lose. You've been warned.
</template>

<script>
import lightning from './Lightning'

export default {
  components: { lightning },
} 
</script>
