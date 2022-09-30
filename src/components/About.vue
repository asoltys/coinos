<template>
  <div>
    <v-card class="mb-8">
      <v-card-text class="white--text body-1">
        <h1 class="mb-8">About</h1>

        <div class="d-flex">
          <div class="mr-4">
            <a href="https://twitter.com/adamsoltys">
              <v-avatar class="mr-2" size="100"
                ><img src="/adam.png"
              /></v-avatar>
            </a>
          </div>

          <p class="mb-8">
            Coinos is an indy bitcoin wallet created by Adam Soltys with the
            intention of providing people with a fast, cheap, and easy way to
            get started with bitcoin. It's free to register an account, you can
            <a href="/register">sign up here</a> with just a username and
            password.
          </p>
        </div>

        <h2 class="mb-8">Features</h2>

        <ul class="mb-8">
          <li>Web based, no need to install an app or download any software</li>
          <li>Mobile device friendly</li>
          <li>
            Open source, you can check out
            <a href="https://github.com/asoltys/coinos">the code</a>
            and host your own personalized instance
          </li>
          <li>Easy price conversion from BTC to any local currency</li>
          <li>
            Includes simple Point-of-Sale features for
            <a href="https://coinos.io/pos">retail merchants</a>
          </li>
          <li>
            Built in tipping option, re-usable payment codes, text notifications
          </li>
          <li>Lightning, LNURL and Liquid support</li>
        </ul>

        <h2 class="mb-8">Custodial By Default</h2>

        <p class="mb-8">
          The default wallet in new coinos accounts is custodial. We hold the
          funds in a hot wallet on our server and allow you to access them
          according to how much you've deposited or received. Funds can be
          deposited via
          <a href="https://bitcoin.org">bitcoin</a>,
          <a href="https://blockstream.com/liquid/">liquid</a>, or
          <a href="http://lightning.network/">lightning</a>.
        </p>

        <p class="mb-8">
          Deposits are credited under a single unified balance so that they can
          be withdrawn or sent out over any network regardless of how they came
          in.
        </p>

        <p class="mb-8">
          A 0.1% conversion fee will be charged when withdrawing over a network
          other than the one you deposited on. Payments between coinos accounts
          are done entirely off-chain in our database so they're fast,
          free and unlimited.
        </p>

        <h2 class="mb-8">Non-Custodial Available</h2>

        <p class="mb-8">
          Non-custodial wallets are generated with client-side JavaScript and
          the wallet seed phrase is encrypted with your account password before
          being sent to our server. You control your own keys in this case.
          This is the preferred method of storing larger amounts of bitcoin once
          your balance grows to a point where it makes sense for you to
          trade some speed and convenience for security.
        </p>

        <h2 class="mb-8">Exchange Rate</h2>

        <p class="mb-8">
          The bitcoin to US dollar exchange rate is streamed every second from
          <a href="https://binance.com/">Binance</a> and converted to other
          currencies using rates from <a href="https://fixer.io/">fixer.io</a>.
        </p>

        <h2 class="mb-8">Need help?</h2>

        <p class="mb-8">
          Fill out our <a href="/support">support form</a> or find us on:
        </p>

        <div class="mb-8">
          <social />
        </div>

        <h2 class="mb-8">Donate</h2>

        <p class="mb-8">
          Want to throw some sats our way? Head on over to our
          <a href="/donate">donation page</a> and let us know if you want to be
          featured as a sponsor on our
          <a href="https://corporate.coinos.io/community">community page</a>.
        </p>
      </v-card-text>
    </v-card>
    <lightning-node />
    <info />
    <div class="d-flex">
      <v-btn
        color="#59316B"
        class="flex-grow-1 mr-2 mb-8 wide"
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

li
  margin-bottom 6px
</style>
