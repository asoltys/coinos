<template>
  <div>
    <v-card class="mb-2">
      <v-card-text class="white--text body-1">
        <p>
          Coinos is a bitcoin web wallet and digital asset exchange platform. Anyone can
          <a href="https://github.com/asoltys/coinos">download the code</a> and
          host it on their own server to become an exchange or act as a custodian, giving others access to their
          nodes and an easy web interface that lets them use bitcoin without having to install an app or configure
          any software.
        </p>

        <p>
        Coinos offers both custodial and non-custodial wallet accounts.
        Funds can be deposited into the custodial server account via any of the
        <a href="https://bitcoin.org">bitcoin</a>,
        <a href="https://blockstream.com/liquid/">liquid</a> or
        <a href="http://lightning.network/">lightning</a> networks and sent
        over any network regardless of how they were deposited.
        There are no fees charged in addition to the network transaction fees. Transfers between users on the
        same server are completely free and off-chain.
        </p>

        <p>Non-custodial wallets are generated with client-side JavaScript. You can import and export your keys and seed. A copy of the master seed is kept on the coinos server after being encrypted with your account password in your browser so we don't have access to it. We could get access to it if we decided to intercept and store your password one day when you're logging in, but we won't do that, I promise. Still, don't put too much money even into a non-custodial wallet here. Coinos is designed to be an everyday spending wallet with more focus on convenience and ease of use than security.</p>

        <p>
        The bitcoin to US dollar exchange rate is streamed every second from
        <a href="https://binance.com/">Binance</a> and converted to other
        currencies using rates from <a href="https://fixer.io/">Fixer</a>.
        </p>

        <p>Users can issue new liquid assets and trade arbitrary assets on our exchange. You can place limit orders to buy or sell any asset for any other asset on the liquid network. Anyone can request coinos to generate an atomic swap transaction and sign off on it to take orders off the order book directly to their external wallet without having to first deposit funds for their side of the transaction into coinos. We provide market liquidity for CAD and USDT pairs with a 1% spread above/below the current Binance price.</p>

        <p class="mb-4">
        Coinos is free software developed by
        <a href="https://adamsoltys.com/">Adam Soltys</a>.
        </p>
        
        <p>
        This publicly hosted exemplary instance of coinos at <a href="coinos.io">coinos.io</a> and <a href="https://bitcoinapp.ca">bitcoinapp.ca</a> is a property of Coinos Financial Corporation, a B.C. Limited Company and FINTRAC-registered Money Services Business.
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
