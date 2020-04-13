<template>
  <div>
    <tippad v-if="tipping" @input="setTip" />
    <div v-else>
      <div v-if="invoice.amount > 0">
        <h1 class="text-center font-weight-black">Requesting</h1>
        <div class="d-flex flex-wrap justify-center">
          <div class="display-1 mr-1">
            <span>{{ total }}</span>
            <v-btn
              class="black--text toggle"
              color="white"
              @click="toggleUnit"
              >{{ user.unit }}</v-btn
            >
          </div>
          <div class="yellow--text display-1">
            <span>{{ invoice.fiatAmount }}</span>
            <span v-if="invoice.tip">&nbsp;<span class="headline">+{{ invoice.fiatTip }}</span></span>
            <v-btn
                  class="black--text toggle"
                  color="yellow"
                  @click="shiftCurrency"
                  >{{ invoice.currency }}</v-btn
                >
          </div>
        </div>
      </div>
      <h1 v-else class="text-center font-weight-black">Receiving Address</h1>
      <v-card class="pa-3 text-center mb-2">
        <div v-if="showcode" class="code mb-4">{{ invoice.text }}</div>
        <canvas
          id="qr"
          v-show="!showcode"
          width="100"
          height="100"
          @click="fullscreen"
          class="w-100 mx-auto mb-2"
          style="cursor: pointer"
        />
        <div class="mb-2" v-if="invoice.amount <= 0">
          <code class="black--text mb-2" :data-clipboard-text="invoice.text">{{
            invoice.text
          }}</code>
        </div>
        <div>
          <v-btn
            v-if="invoice.amount > 0"
            @click.native="tipping = true"
            class="mr-2 mb-2 mb-sm-0 black--text wide"
            color="yellow"
          >
            <span v-if="invoice.tip"
              ><v-icon class="mr-1">edit</v-icon><span>Edit Tip</span></span
            >
            <span v-else
              ><v-icon class="mr-1">add</v-icon><span>Add Tip</span></span
            >
          </v-btn>
          <v-btn
            v-if="invoice.amount > 0"
            @click.native="showcode = !showcode"
            class="mr-2 mb-2 mb-sm-0 wide"
          >
            <v-icon v-if="showcode">crop_free</v-icon>
            <v-icon v-else>code</v-icon>
            <span>{{ code }}</span>
          </v-btn>
          <v-btn @click.native="() => copy(invoice.text)" class="wide mr-2 mb-2 mb-sm-0">
            <v-icon>content_copy</v-icon><span>Copy</span>
          </v-btn>
          <v-btn v-if="invoice.method === 'bitcoin'" @click="address" class="wide">
            <v-icon>refresh</v-icon><span>Address</span>
          </v-btn>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
import qr from 'qrcode';
import { mapActions } from 'vuex';
import { get, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import FullScreen from '../mixins/FullScreen';
import Utils from '../mixins/Utils';
import Tippad from './TipPad';

const SATS = 100000000;

export default {
  components: { Tippad },
  mixins: [Copy, FullScreen, Utils],
  props: {
    clear: { type: Function },
  },

  data() {
    return {
      showcode: false,
      tipping: false,
    };
  },

  computed: {
    total() {
      return this.btc(this.invoice.amount + this.invoice.tip);
    },
    invoice: get('invoice'),
    user: get('user'),
    code() {
      return this.showcode ? 'Show QR' : 'Show Text';
    },
  },

  mounted() {
    this.draw();
  },

  methods: {
    ...mapActions(['addInvoice', 'getNewAddress', 'shiftCurrency', 'snack']),
    async address() {
      await this.getNewAddress();
      this.draw();
    },
    draw() {
      this.$nextTick(() => {
        let canvas = document.getElementById('qr');
        if (!canvas) return;

        qr.toCanvas(canvas, this.invoice.text, e => {
          if (e) console.log(e);
        });

        canvas.style.width = '35vh';
        canvas.style.height = '35vh';
      });
    },
    async setTip(tip, fiatTip) {
      this.tipping = false;
      this.invoice.tip = tip;
      this.invoice.fiatTip = fiatTip;
      await this.addInvoice();
      this.draw();
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

.toggle
  margin auto 0.25rem !important
  margin-top -0.3rem !important
  height 1.7rem !important
  min-width 3rem !important
  width 3rem !important
</style>
