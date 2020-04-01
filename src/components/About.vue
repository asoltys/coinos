<template>
  <div>
    <v-card class="mb-2">
      <v-card-text class="white--text body-1">
        <p>
          Coinos is a bitcoin wallet app. You can
          <a href="https://github.com/asoltys/coinos">run</a> it on your own
          server and connect it to your bitcoin and lightning nodes if you want
          full control of your funds or
          <a @click="createUser">create a free account</a>
          here that you can begin using right away.
        </p>

        <div v-if="more">
          <p>
            Coinos is suitable for individuals wanting a day-to-day spending
            wallet and merchants seeking to receive and track payments in a
            retail environment. It can be installed on any platform, mobile or
            desktop, and launched as an app in full-screen mode, or accessed as
            a website within a browser.
          </p>

          <p>
            The bitcoin to US dollar exchange rate is streamed every second from
            <a href="https://binance.com/">Binance</a> and converted to other
            currencies using FX rates fetched once a day from
            <a href="https://fixer.io/">Fixer</a>.
          </p>

          <p>
            Funds can be deposited via the
            <a href="https://bitcoin.org">bitcoin</a>,
            <a href="https://blockstream.com/liquid/">liquid</a> or
            <a href="http://lightning.network/">lightning</a> networks. Outgoing
            payments can be made using any of the above methods as well. Coinos
            keeps track of a single unified balance for each user that
            determines their spending power across all three networks.
          </p>

          <p>
            Users of this hosted coinos instance don't need to worry about
            software installation, blockchain synchronization, server
            administration or channel management. This is the way to go if
            you're just trying things out or want to use the app for small
            payments in amounts that you're comfortable trusting me with.
          </p>

          <p>
            If you're interested in hosting your own node and maintaining full
            custody of your funds or using coinos to offer people user accounts
            and easy web-based access to your own nodes, there are
            <a href="https://github.com/asoltys/coinos-server"
              >instructions on Github</a
            >
            to get you started. You might consider hosting your instance as an
            <a href="https://community.torproject.org/onion-services/"
              >onion service</a
            >
            on the Tor network.
          </p>

          <p>
            Coinos is developed by
            <a href="https://adamsoltys.com/">Adam Soltys</a>. I would caution
            against storing more funds in your account here than you can afford
            to lose. If you plan to host coinos on your own server and connect
            it to your nodes, please consider reviewing the code and satisfying
            yourself that it's safe before doing so. The code hasn't been
            audited and I can't make any guarantees about its security. I will
            not be held responsible for any loss of funds resulting from the use
            of this software.
          </p>

          <p>
            If you're a business owner with a retail storefront and are
            interested in using coinos to receive payments I would love to
            <a href="mailto:asoltys@gmail.com">hear from you</a> and would be
            glad to support you in that.
          </p>
        </div>
        <v-btn
          @click="more = true"
          v-if="!more"
          class="d-block mx-auto black--text mb-2"
          color="yellow"
        >
          <v-icon class="mr-1">expand_more</v-icon>
          <span>Learn More</span>
        </v-btn>
      </v-card-text>
    </v-card>

    <iframe width="100%" height="315" src="https://www.youtube.com/embed/KFGJKjnPF84" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

    <lightning-node />
    <stats />
    <privacy-policy />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import PrivacyPolicy from './PrivacyPolicy';
import Stats from './Stats';
import LightningNode from './LightningNode';

export default {
  components: { LightningNode, PrivacyPolicy, Stats },
  data() {
    return { more: false };
  },

  methods: {
    ...mapActions(['createUser', 'snack']),
  },
};
</script>

<style lang="stylus" scoped>
.v-application code
  max-width 100%
  word-wrap break-word
  font-size 0.8em
</style>
