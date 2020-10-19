<template>
  <div>
    <v-card class="mb-2">
      <v-card-text class="white--text body-1">
        <p>
          Coinos is a bitcoin web wallet and digital asset exchange platform. Anyone can
          <a href="https://github.com/asoltys/coinos">download the code</a> and
          host it on their own server to give people an easy way to access their
          nodes and use bitcoin without having to install an app or configure
          any software.
        </p>

        <p>
        Coinos offers both custodial and non-custodial wallet accounts.
        Funds can be deposited into the custodial server account via any of the
        <a href="https://bitcoin.org">bitcoin</a>,
        <a href="https://blockstream.com/liquid/">liquid</a> or
        <a href="http://lightning.network/">lightning</a> networks and sent
        over any network regardless of how they were deposited.
        There are no fees charged in addition to the network transaction fees
        which can be customized. Transfers between users on the
        same server are completely free and off-chain.
        </p>

        <p>
        The bitcoin to US dollar exchange rate is streamed every second from
        <a href="https://binance.com/">Binance</a> and converted to other
        currencies using rates from <a href="https://fixer.io/">Fixer</a>.
        </p>

        <p class="mb-4">
        Coinos is free software developed by
        <a href="https://adamsoltys.com/">Adam Soltys</a>.
        </p>
        
        <p>
        coinos.io is a property of Coinos Financial Corporation, a B.C. Limited Company and FINTRAC-registered Money Services Business.
        </p>
        <social />
      </v-card-text>
    </v-card>
    <lightning-node />
    <info />
    <div class="d-flex">
      <v-btn
        color="#59316B"
        class="flex-grow-1 mr-2 mb-2 wide"
        @click="
          go(
            'http://uzmim34vid5dkyzjxpel6zbkfz4qeqaaqe3gqrtbmekhxqglvzau73ad.onion/'
          )
        "
      >
        <v-icon left>$tor</v-icon>
        Visit Our Tor Hidden Service
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Info from './Info';
import LightningNode from './LightningNode';
import Social from './Social';

export default {
  components: { LightningNode, Social, Info },

  methods: {
    go(url) {
      window.location.href = url;
    },
    ...mapActions(['snack']),
  },

  async mounted() {},
};
</script>

<style lang="stylus" scoped>
.v-application a
  text-decoration none
</style>
