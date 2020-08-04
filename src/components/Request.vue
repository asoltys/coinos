<template>
  <div>
    <tippad v-if="tipping" @input="setTip" />
    <div v-else>
      <div v-if="invoice.amount > 0 || invoice.network === 'LNBTC'">
        <h1 class="text-center font-weight-black">Requesting</h1>
        <div v-if="invoice.amount > 0" class="d-flex flex-wrap justify-center">
          <div class="display-1 mr-1">
            <span>{{ total }}</span>
            <v-btn
              class="black--text toggle"
              :color="color(ticker)"
              @click="toggleUnit"
              >{{ ticker }}</v-btn
            >
            <span class="print body-1">{{ ticker }}</span>
          </div>
          <div v-if="isBtc" class="yellow--text display-1">
            <span>{{ invoice.fiatAmount }}</span>
            <span v-if="invoice.tip"
              >&nbsp;<span class="headline">+{{ invoice.fiatTip }}</span></span
            >
            <v-btn
              class="black--text toggle"
              color="yellow"
              @click="shiftCurrency"
              >{{ invoice.currency }}</v-btn
            >
            <span class="print body-1">{{ invoice.currency }}</span>
          </div>
        </div>
      </div>
      <h1 v-else class="text-center font-weight-black">Receiving Address</h1>
      <v-card class="pa-3 text-center mb-2">
        <lnurl v-if="lnurl && lnurl.encoded" :lnurl="lnurl" />
        <qr v-else-if="!showcode" :text="invoice.text" />
        <div
          class="mb-2"
          v-if="invoice.amount <= 0 && !invoice.memo && invoice.network !== 'LNBTC'"
        >
          <code class="black--text mb-2" :data-clipboard-text="invoice.text">{{
            invoice.text
          }}</code>
        </div>
        <div v-if="!lnurl">
          <div class="code mb-4" :class="{ print: !showcode }">
            {{ invoice.text }}
          </div>
          <v-btn
            v-if="invoice.amount > 0"
            @click.native="tipping = true"
            class="mr-2 mb-2 mb-sm-0 wide"
          >
            <template v-if="invoice.tip">
              <v-icon left>edit</v-icon><span>Edit Tip</span>
            </template>
            <template v-else>
              <v-icon left>add</v-icon><span>Add Tip</span>
            </template>
          </v-btn>
          <v-btn
            v-if="invoice.amount > 0 || invoice.memo || invoice.network === 'LNBTC'"
            @click.native="showcode = !showcode"
            class="mr-2 mb-2 mb-sm-0 wide"
          >
            <qrcode v-if="showcode" class="mr-1" />
            <v-icon v-else class="mr-1">code</v-icon>
            <span>{{ code }}</span>
          </v-btn>
          <v-btn
            @click.native="copy(invoice.text)"
            class="wide mr-2 mb-2 mb-sm-0"
          >
            <v-icon left>content_copy</v-icon><span>Copy</span>
          </v-btn>
          <v-btn
            v-if="invoice.network === 'LNBTC'"
            @click.native="getPaymentUrl"
            class="wide mr-2 mb-2 mb-sm-0"
          >
            <qrcode class="mr-1" />
            LNURL
          </v-btn>
          <v-btn
            v-if="invoice.method === 'bitcoin'"
            @click="newAddress"
            class="wide"
          >
            <v-icon left>refresh</v-icon><span>Address</span>
          </v-btn>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { get, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Tippad from './TipPad';
import Qrcode from 'vue-material-design-icons/Qrcode';
import Qr from './Qr';
import Lnurl from './Lnurl';

const SATS = 100000000;

export default {
  components: { Qrcode, Qr, Tippad, Lnurl },
  mixins: [Copy],
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
    isBtc() {
      return this.user.account.ticker === 'BTC';
    },
    ticker() {
      return this.user.unit === 'BTC' ? this.user.account.ticker : 'SAT';
    },
    total() {
      return this.$format(this.invoice.amount + this.invoice.tip);
    },
    lnurl: get('lnurl'),
    invoice: get('invoice'),
    user: get('user'),
    code() {
      return this.showcode ? 'Show QR' : 'Show Text';
    },
  },

  methods: {
    ...mapActions([
      'addInvoice',
      'getNewAddress',
      'getPaymentUrl',
      'shiftCurrency',
      'snack',
      'toggleUnit',
      'stopWriting',
    ]),

    async newAddress() {
      await this.getNewAddress();
      await this.addInvoice({ method: 'bitcoin', user: this.invoice.user });
    }, 

    color(c) {
      return ['BTC', 'SAT'].includes(c)
        ? 'white'
        : this.user.currencies.includes(c)
        ? 'yellow'
        : '#0ae';
    },

    async setTip(tip, fiatTip) {
      this.tipping = false;
      this.invoice.tip = tip;
      this.invoice.fiatTip = fiatTip;
      await this.addInvoice();
    },
  },
  beforeRouteLeave() {
    this.stopWriting();
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
</style>
