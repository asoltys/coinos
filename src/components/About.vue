<template lang="pug">
v-card
  v-card-text
    p CoinOS is a lightning enabled Bitcoin wallet and point of sale app that you can use to send and receive payments
    p The app is free to use and the source code is available on #[a(href="https://github.com/asoltys/coinos.io") Github]
  lightning
  v-card-text
    p This wallet is still under development.  There are known bugs and minimal security measures are in place so don't use it with more than pocket change that you're willing to lose.
</template>

<script>
import lightning from './Lightning'

export default {
  components: { lightning },
} 
</script>

<style lang="stylus">
a
  color white
  font-weight bold
</style>
