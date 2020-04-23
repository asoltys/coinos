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

        <div v-if="more">
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
            <a href="https://adamsoltys.com/">Adam Soltys</a>. I will not be
            held responsible for any loss of funds resulting from the use of
            this software.
          </p>
          <social />
          <lightning-node />
        </div>
        <v-btn
          @click="more = true"
          v-if="!more"
          class="d-block mx-auto black--text mb-2"
          color="yellow"
        >
          <v-icon class="mr-1">expand_more</v-icon>
          <span>More Details</span>
        </v-btn>
      </v-card-text>
    </v-card>

        <div class="embed-responsive embed-responsive-16by9">
          <iframe
            class="embed-responsive-item"
            title="Coinos Bitcoin Wallet"
            src="https://www.youtube.com/embed/6Om9-7qqxmY?rel=0&amp;showinfo=0&amp;VQ=HD1024"
            allowfullscreen
          ></iframe>
    </div>

    <stats />
    <privacy-policy />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import PrivacyPolicy from './PrivacyPolicy';
import Stats from './Stats';
import LightningNode from './LightningNode';
import Social from './Social';

export default {
  components: { LightningNode, PrivacyPolicy, Social, Stats },
  data() {
    return {
      playerOptions: {
        poster: '/intro.png',
        autoplay: false,
        controls: true,
        sources: [
          {
            type: 'video/mp4',
            src:
              'https://skynet.adamsoltys.com/AAAXCwYEUgNvZ77YVTJiX0NopwU08k1j0f0AjXxrpC7kBA',
          },
        ],
      },
      more: false,
    };
  },

  methods: {
    ...mapActions(['createUser', 'snack']),
  },

  async mounted() {},
};
</script>

<style lang="stylus" scoped>
.v-application a
  text-decoration none

.embed-responsive {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  overflow: hidden;
}
.embed-responsive::before {
  display: block;
  content: "";
}
.embed-responsive .embed-responsive-item,
.embed-responsive iframe,
.embed-responsive embed,
.embed-responsive object,
.embed-responsive video {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.embed-responsive-21by9::before {
  padding-top: 42.8571428571%;
}

.embed-responsive-16by9::before {
  padding-top: 56.25%;
}

.embed-responsive-4by3::before {
  padding-top: 75%;
}

.embed-responsive-1by1::before {
  padding-top: 100%;
}
</style>
