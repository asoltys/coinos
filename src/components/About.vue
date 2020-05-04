<template>
  <div>
    <v-card class="mb-2">
      <v-card-text class="white--text body-1">
        <p>
          Coinos is a bitcoin wallet app. You can
          <a href="https://github.com/asoltys/coinos"
            >run it on your own server</a
          >
          or
          <a @click="createUser">create a free account</a>
          here that you can begin using right away.
        </p>

        <div>
          <p>
            The bitcoin to US dollar exchange rate is streamed every second from
            <a href="https://binance.com/">Binance</a> and converted to other
            currencies using FX rates fetched once a day from
            <a href="https://fixer.io/">Fixer</a>.
          </p>

          <p>
            Deposit and withdraw via the
            <a href="https://bitcoin.org">bitcoin</a>,
            <a href="https://blockstream.com/liquid/">liquid</a> or
            <a href="http://lightning.network/">lightning</a> networks. You can
            use coinos to easily move funds between these three networks without
            any addtional fees beyond the customizable on-chain transaction fee.
          </p>

          <p class="mb-4">
            Coinos is developed by
            <a href="https://adamsoltys.com/">Adam Soltys</a>.
          </p>
        </div>
          <social />
      </v-card-text>
    </v-card>
          <lightning-node />
    <stats />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Stats from './Stats';
import LightningNode from './LightningNode';
import Social from './Social';

export default {
  components: { LightningNode, Social, Stats },

  methods: {
    ...mapActions(['createUser', 'snack']),
  },

  async mounted() {},
};
</script>

<style lang="stylus" scoped>
.v-application a
  text-decoration none
</style>


