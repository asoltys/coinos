<template>
  <div>
    <tippad v-if="tipping" @input="setTip" />
    <v-card v-else class="pa-3 text-center mb-2">
      <div v-if="lnurl && lnurl.encoded">
        <lnurl :lnurl="lnurl" />
        <v-btn @click="lnurl = null" class="mb-1 mb-sm-0 wide">
          <v-icon left>$arrow_back</v-icon>
          Back
        </v-btn>
      </div>
      <div v-else>
        <invoice-balance v-if="fullscreen" />
        <qr :text="invoice.text" />
        <div v-if="fullscreen" class="ma-4">{{ invoice.memo }}</div>
        <customer-controls v-if="fullscreen" @cancel="fullscreen = false" @tipping="tipping = true" />
        <invoice-controls v-else @lock="fullscreen = true" />
      </div>
    </v-card>
  </div>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Lnurl from './Lnurl';
import Qr from './Qr';
import Tippad from './TipPad';
import InvoiceBalance from './InvoiceBalance';
import CustomerControls from './InvoiceCustomerControls';
import InvoiceControls from './InvoiceControls';

export default {
  components: { Qr, Tippad, Lnurl, InvoiceBalance, CustomerControls, InvoiceControls },
  mixins: [Copy],
  props: {
    clear: { type: Function },
  },

  data() {
    return {
      tipping: false,
    };
  },

  computed: {
    fullscreen: sync('fullscreen'),
    loading: get('loading'),
    networks() {
      return this.nodes.map(n => ({
        text: n[0].toUpperCase() + n.slice(1),
        value: n,
      }));
    },
    nodes: get('nodes'),
    text() {
      return this.invoice.address || this.invoice.text;
    },
    ticker() {
      return this.user.unit === 'BTC' ? this.user.account.ticker : 'SAT';
    },
    total() {
      return this.$format(this.invoice.amount + this.invoice.tip);
    },
    lnurl: sync('lnurl'),
    invoice: sync('invoice'),
    amount: sync('invoice@amount'),
    path: sync('invoice@path'),
    type: sync('invoice@addressType'),
    user: get('user'),
  },

  methods: {
    addInvoice: call('addInvoice'),
    clearInvoice: call('clearInvoice'),

    getPaymentUrl: call('getPaymentUrl'),
    shiftCurrency: call('shiftCurrency'),
    toggleUnit: call('toggleUnit'),
    stopWriting: call('stopWriting'),


    async setTip(tip, fiatTip) {
      this.tipping = false;
      this.invoice.tip = tip;
      this.invoice.fiatTip = fiatTip;
      await this.addInvoice();
    },
  },
  beforeDestroy() {
    this.clearInvoice();
  },
  async mounted() {
    const waitForUser = resolve => {
      if (!this.user.index && this.user.index !== 0)
        return this.timeout = setTimeout(() => waitForUser(resolve), 1000);
      resolve();
    };
    await new Promise(waitForUser);
    this.addInvoice();
  },
};
</script>

