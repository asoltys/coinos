<template>
  <div>
    <tippad v-if="tipping" @input="setTip" />
    <div v-else>
      <div v-if="invoice.amount > 0">
        <h1 class="text-center font-weight-black">Requesting</h1>
        <div class="d-flex justify-center mb-2">
          <div class="mr-2">
            <span class="display-1">{{ total }}</span>
      <v-btn
        class="black--text toggle"
        color="white"
        @click="toggleUnit"
        >{{ user.unit }}</v-btn>
          </div>
          <div>
            <span class="yellow--text">
              <span class="display-1">{{ invoice.fiatAmount }}</span>
              <span v-if="invoice.tip">&nbsp;(+{{ invoice.fiatTip }})</span>
      <v-btn
        class="black--text toggle"
        color="yellow"
        @click="shiftCurrency"
        >{{ invoice.currency }}</v-btn>
            </span>
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
            <span v-if="invoice.tip"><v-icon class="mr-1">edit</v-icon><span>Edit Tip</span></span>
            <span v-else><v-icon class="mr-1">add</v-icon><span>Add Tip</span></span>
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
          <v-btn @click.native="() => copy(invoice.text)" class="wide">
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
      console.log(this.invoice.amount, this.invoice.tip);
      return this.btc(this.invoice.amount + this.invoice.tip);
    },
    invoice: get('invoice'),
    user: get('user'),
    code() {
      return this.showcode ? 'Show QR' : 'Show Code';
    },
  },

  mounted() {
    this.draw();
  },

  methods: {
    ...mapActions(['addInvoice', 'shiftCurrency', 'snack']),
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
  max-height 24px
  margin-top -12px
  margin-left 5px
  min-width 44px !important
  width 44px !important
</style>
