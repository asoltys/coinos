<template>
  <div>
    <v-card class="mb-2">
      <v-card-text class="white--text body-1">
        <p>
          Coinos is a bitcoin wallet app. You can
          <a href="https://github.com/asoltys/coinos.io">install</a> it on your
          own server and connect it to your bitcoin and lightning nodes if you
          want full control of your funds, or,
          <a @click="createUser">create a free account</a>
          here that you can begin using right away without providing any
          personal information.
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
            Funds can be deposited/received via the
            <a href="https://bitcoin.org">bitcoin</a>,
            <a href="https://blockstream.com/liquid/">liquid</a> or
            <a href="http://lightning.network/">lightning</a> networks. Outgoing
            payments/withdrawals can be made using any of the above methods as
            well. Coinos keeps track of a single unified balance for each user
            that determines their spending power across all three networks.
          </p>

          <p>
            Users of the free, hosted instance here don’t need to worry about
            software installation, blockchain synchronization, server admin,
            channel management or account configuration. They can create an
            account with one click and begin sending and receiving payments
            immediately. This may be the way to go if you're trying things out
            or want to use the app for small retail payments up to a few hundred
            dollars.
          </p>

          <p>
            If you're interested in hosting your own node and maintaining full
            custody of your funds, there are
            <a href="https://github.com/asoltys/coinos-server"
              >instructions on Github</a
            >. You can then offer the same simple and friendly interface to
            people in your circle of trust or even the public if you dare. Go
            ahead, be your own bank!
          </p>

          <p>
            Coinos is a labour of love developed by
            <a href="https://adamsoltys.com/">Adam Soltys</a>. It's a perennial
            work in progress and should be treated as such. Here be dragons. Do
            not store more money in your account than you can afford to lose,
            and don't give access to your own nodes if you're storing a lot of
            funds there or unless you're capable of reviewing the code and
            satisfying yourself that it's safe. This is alpha software that has
            not been vetted or audited very widely and I'm not making any
            guarantees about it's security and will not be held responsible for
            loss of funds.
          </p>

          <p>If you're a business owner with a retail storefront and are interested in using coinos to receive payments I would love to <a href="mailto:asoltys@gmail.com">hear from you</a> and would be glad to support you in that.</p>
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

    <v-card>
      <v-card-text>
        <h3 class="mb-4 text-center">Lightning Node Info</h3>
        <canvas id="qr" class="d-block mx-auto mb-4" />
        <div class="text-center my-4">
          <code class="black--text" :data-clipboard-text="node">{{
            node
          }}</code>
        </div>
        <v-btn @click="() => copy(node)" class="d-block mx-auto">
          <v-icon class="mr-1">content_copy</v-icon><span>Copy</span>
        </v-btn>
      </v-card-text>
    </v-card>
    <v-card class="mt-2">
      <v-card-title>Privacy Policy</v-card-title>
      <v-card-text class="white--text body-1">
        We don't require any personal information. If you login with Facebook,
        we access your friends list in order to populate your address book.
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import qr from 'qrcode';
import { mapActions } from 'vuex';
import Copy from '../mixins/Copy';

const node =
  '02868e12f320073cad0c2959c42559fbcfd1aa326fcb943492ed7f02c9820aa399@coinos.io:9735';

export default {
  mixins: [Copy],
  data() {
    return { more: false, node };
  },

  mounted() {
    let canvas = document.getElementById('qr');
    if (!canvas) return;
    qr.toCanvas(canvas, node, e => {
      if (e) console.log(e);
    });
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
