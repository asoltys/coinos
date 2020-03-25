<template>
  <div>
    <tippad v-if="tipping" :amount="amount" @input="setTip" />
    <div v-else>
      <div v-if="amount > 0">
        <h1 class="text-center font-weight-black">Requesting</h1>
        <div class="d-flex justify-center mb-2">
          <div class="mr-2">
            <span class="display-1">{{ amount + tip }}</span>
            SAT
          </div>
          <div>
            <span class="yellow--text">
              <span class="display-1">{{ fiatAmount }}</span>
              <span v-if="tip">&nbsp;(+{{ fiatTip }})</span>
              {{ user.currency }}
            </span>
          </div>
        </div>
        <div></div>
      </div>
      <h1 v-else class="text-center font-weight-black">Receiving Address</h1>
      <v-card class="pa-3 text-center mb-2">
        <div v-if="showcode" class="code mb-4">{{ text }}</div>
        <canvas
          id="qr"
          v-show="!showcode"
          width="100"
          height="100"
          @click="fullscreen"
          class="w-100 mx-auto mb-2"
        />
        <div class="mb-2" v-if="!(amount > 0)">
          <code class="black--text mb-2" :data-clipboard-text="text">{{
            text
          }}</code>
        </div>
        <div>
          <v-btn
            @click.native="tipping = true"
            class="mr-2 mb-2 mb-sm-0 black--text wide"
            color="yellow"
          >
            <span v-if="tip"><v-icon>edit</v-icon><span>Edit Tip</span></span>
            <span v-else><v-icon>add</v-icon><span>Add Tip</span></span>
          </v-btn>
          <v-btn
            v-if="amount > 0"
            @click.native="showcode = !showcode"
            class="mr-2 mb-2 mb-sm-0 wide"
          >
            <v-icon v-if="showcode">crop_free</v-icon>
            <v-icon v-else>code</v-icon>
            <span>{{ code }}</span>
          </v-btn>
          <v-btn @click.native="() => copy(text)" class="wide">
            <v-icon>content_copy</v-icon><span>Copy</span>
          </v-btn>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
import qr from 'qrcode';
import { mapGetters, mapActions } from 'vuex';
import { get, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Tippad from './TipPad';

const SATS = 100000000;

export default {
  components: { Tippad },
  mixins: [Copy],
  props: {
    clear: { type: Function },
    total: { type: String },
  },

  data() {
    return {
      full: false,
      showcode: false,
      tipping: false,
    };
  },

  computed: {
    ...mapGetters(['amount', 'fiatAmount', 'rate', 'user']),
    fiatTip() {
      return ((this.tip / SATS) * this.rate).toFixed(2);
    },
    text: get('text'),
    tip: sync('tip'),
    code() {
      return this.showcode ? 'Show QR' : 'Show Code';
    },
  },

  mounted() {
    this.draw();
  },

  methods: {
    ...mapActions(['generateRequest', 'snack']),
    draw() {
      this.$nextTick(() => {
        let canvas = document.getElementById('qr');
        if (!canvas) return;

        qr.toCanvas(canvas, this.text, e => {
          if (e) console.log(e);
        });

        canvas.style.width = '35vh';
        canvas.style.height = '35vh';
      });
    },
    async setTip(e) {
      this.tipping = false;
      console.log(e);
      this.tip = e;
      await this.generateRequest();
      this.draw();
    },
    fullscreen() {
      if (this.full) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        this.full = false;
        return;
      }

      let elem = document.getElementById('qr');

      if (elem.requestFullscreen) {
        elem.requestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }

      this.full = true;
    },
  },
};
</script>

<style lang="stylus" scoped>
.code
  margin auto
  width 260px
  height 260px
  background #333
  word-wrap break-word
  padding 15px

.v-application code
  max-width 100%
  word-wrap break-word
  font-size 0.8em
</style>
