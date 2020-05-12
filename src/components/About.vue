<template>
  <div>
    <v-card class="mb-2">
      <v-card-text class="white--text body-1">
        <p>
          Coinos is a bitcoin wallet app. You can
          <a href="https://github.com/asoltys/coinos"
            >download the code and run it on your own server</a
          >
          or
          create a free account
          here that you can begin using right away.
        </p>

        <div>
          <p>
            Deposit via the
            <a href="https://bitcoin.org">bitcoin</a>,
            <a href="https://blockstream.com/liquid/">liquid</a> or
            <a href="http://lightning.network/">lightning</a> networks and withdraw on any network regardless of how your funds were deposited. There are no fees besides on-chain transaction fees which can be customized.
          </p>

          <p>
            The bitcoin to US dollar exchange rate is streamed every second from
            <a href="https://binance.com/">Binance</a> and converted to other
            currencies using rates from
            <a href="https://fixer.io/">Fixer</a>.
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
    ...mapActions(['snack']),
  },

  async mounted() {},
};
</script>

<style lang="stylus" scoped>
.v-application a
  text-decoration none
</style>


