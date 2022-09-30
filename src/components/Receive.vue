<template>
  <div>
    <tippad v-if="tipping" :tipping="tipping" @input="setTip" />
    <v-card v-show="!tipping" class="text-center mb-2 py-2 px-0 mx-0">
     <div v-if="lnurl && lnurl.encoded">
        <lnurl :lnurl="lnurl" />
        <v-btn @click="lnurl = null" class="mb-1 mb-sm-0 wide">
          <v-icon left>$left</v-icon>
          Back
        </v-btn>
      </div>
      <div v-show="!(lnurl && lnurl.encoded)">
        <div class="d-flex" v-if="!fullscreen">
          <v-btn-toggle
            v-model="invoice.network"
            tile
            color="primary accent-3"
            group
            @change="addInvoice"
            class="mx-auto flex-wrap mb-4"
          >
            <v-btn value="bitcoin" class="flex-grow-1" v-if="!user.account.pubkey || user.account.network === 'bitcoin'">
              <v-icon left title="Bitcoin">$bitcoin</v-icon>
              Bitcoin
            </v-btn>
            <v-btn value="liquid" class="flex-grow-1" v-if="!user.account.pubkey || user.account.network === 'liquid'">
              <v-icon left color="liquid" title="Liquid">$liquid</v-icon>
              Liquid
            </v-btn>

            <v-btn value="lightning" class="flex-grow-1" v-if="!user.account.pubkey">
              <v-icon left color="primary" title="Lightning">$flash</v-icon>
              Lightning
            </v-btn>
          </v-btn-toggle>
        </div>
        <qr :text="invoice.text" v-if="fullscreen" />
          <invoice-balance />
        <div class="ma-4 px-1">
          <v-progress-linear v-if="loading" indeterminate color="primary" />
          <div v-else class="body-1">{{ text }}</div>
        </div>
        <div class="ma-4 font-weight-bold">{{ invoice.memo }}</div>
        <customer-controls
          v-if="fullscreen && !hideControls"
          @cancel="fullscreen = false"
          @tipping="tipping = true"
        />
        <invoice-controls v-show="!fullscreen" @display="fullscreen = true" />
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
  components: {
    Qr,
    Tippad,
    Lnurl,
    InvoiceBalance,
    CustomerControls,
    InvoiceControls,
  },
  mixins: [Copy],
  props: {
    clear: { type: Function },
  },

  data: () => ({
    model: 0,
    colors: ['secondary', 'secondary'],
    tipping: false,
  }),

  computed: {
    hideControls: get('hideControls'),
    fullscreen: sync('fullscreen'),
    loading: get('loading'),
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
    this.fullscreen = false;
    this.clearInvoice();
  },
  async mounted() {
    const waitForUser = resolve => {
      if (!this.user.index && this.user.index !== 0)
        return (this.timeout = setTimeout(() => waitForUser(resolve), 1000));
      resolve();
    };
    await new Promise(waitForUser);
    this.addInvoice();
  },
};
</script>
