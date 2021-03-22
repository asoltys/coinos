<template>
  <div>
    <v-card class="mb-2">
      <v-card-text class="white--text body-1">
        <p>
          Coinos is an open source bitcoin web wallet. Anyone can
          <a href="https://github.com/asoltys/coinos"
            >download the code that runs it</a
          >
          and host it on their own server to let people access their
          <a href="https://bitcoin.org/en/download">bitcoind</a>,
          <a href="https://docs.blockstream.com/liquid/node_setup.html"
            >liquid</a
          >,
          <a href="https://lightning.readthedocs.io/INSTALL.html"
            >c-lightning</a
          >
          or
          <a
            href="https://github.com/lightningnetwork/lnd/blob/master/docs/INSTALL.md"
            >lnd</a
          >
          node(s) on the web.
        </p>

        <p>
          Coinos lets you create both custodial and non-custodial wallets within
          your account. The advantage of using a custodial wallet is that funds
          can be deposited via any of the
          <a href="https://bitcoin.org">bitcoin</a>,
          <a href="https://blockstream.com/liquid/">liquid</a> or
          <a href="http://lightning.network/">lightning</a> networks and
          seamlessly converted and sent over any of the other two networks
          regardless of how they were deposited.
        </p>

        <p>
          We don't charge any fees. Transfers between users on the same server are
          automatically done off-chain and are completely free and unlimited.
        </p>

        <p>
          The bitcoin to US dollar exchange rate is streamed every second from
          <a href="https://binance.com/">Binance</a> and converted to other
          currencies using rates from <a href="https://fixer.io/">Fixer</a>.
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
