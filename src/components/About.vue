<template lang="pug">
v-card
  v-card-text
    p CoinOS is a free wallet and point of sale app that you can use to send and receive Bitcoin payments
    p The app is free to use and the source code is available at #[a(href="https://github.com/asoltys/coinos.io") Github]
  lightning
  v-card-text
    p This is a pet project that I built for myself as a learning experience and comes with no guarantees of security or availability
    p Please don't risk depositing any money here that you are not willing to lose as this wallet has not been audited for bugs and security issues are likely to exist
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
