<template>
  <div>
    <v-card class="mb-2">
      <v-card-text class="white--text body-1">
        <p>
          Coinos is a bitcoin wallet app developed by
          <a href="https://adamsoltys.com/">Adam Soltys</a>. You can
          <a href="https://github.com/asoltys/coinos.io">install</a> and host it
          yourself and connect it to your own bitcoin and lightning nodes if you
          want full control of your funds. Or,
          <a @click="createUser">create a free account</a>
          here that you can begin using right away without providing any
          personal information.
        </p>

        <div v-if="more">
          <p>
            We aim to provide a user-friendly interface to send and receive
            bitcoin payments for both individuals wanting a day-to-day spending
            wallet and merchants seeking to receive payments in a retail
            environment. Coinos is
            <a href="https://en.wikipedia.org/wiki/Responsive_web_design"
              >responsive</a
            >
            and
            <a href="https://en.wikipedia.org/wiki/Progressive_web_application"
              >progressive</a
            >
            so it can be installed on any platform, mobile or desktop, and
            launched as an app for a full-screen experience, or simply accessed
            as a website within a browser.
          </p>

          <p>
            Accounts can be funded with
            <a href="https://bitcoin.org">bitcoin</a>,
            <a href="https://blockstream.com/liquid/">liquid</a> or
            <a href="http://lightning.network/">lightning</a> payments. Outgoing
            payments can be sent using any of the above methods as well. Coinos
            keeps track of a single, combined balance for each user across all
            three networks, granting them spending power on any and all of our
            backend full nodes according to how much they've deposited or
            received.
          </p>

          <p>
            User accounts, balances and payment history are stored in a
            <a href="https://mariadb.org/">relational database</a>. Exchange
            rates are fetched from
            <a href="https://binance.com/">Binance</a> and
            <a href="https://fixer.io/">Fixer</a>.
          </p>

          <p>
            Users of our server enjoy a streamlined experience with one-click
            account creation and no KYC. They don’t need to worry about software
            installation, blockchain synchronization, server setup, channel
            management or account configuration of any kind.
          </p>

          <p>
            Those of you who prefer to self-host and maintain full custody of
            your funds are encouraged to do so following the
            <a href="https://github.com/asoltys/coinos-server"
              >instructions on Github</a
            >. You may decide to run another public instance or to limit access
            to friends, family, or others in your circle of trust, offering the
            same kind of experience but to people who would prefer to trust you
            rather than me. Be your own bank!
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
