<template>
  <div>
    <sent v-if="payment.sent" />
    <div v-else>
      <h1>Sweep Funds</h1>
      <v-card v-if="!editing" class="mb-2">
        <v-card-text class="text-center">
          <div class="display-2 font-weight-black white--text">
            {{ $format(balance, 0) }}
            <span>SAT</span>
            <div class="fiat primary--text display-1 my-auto">
              {{ fiat }}
              {{ user.currency }}
            </div>
          </div>
          <div class="red--text" v-if="pending > 0">
            <span class="display-1 font-weight-black"
              >{{ $format(pending) }}
            </span>
            <span class="headline">UNCONFIRMED</span>
          </div>
          <qr :text="address" v-if="show" />
          <v-textarea
            label="From Address"
            :value="address"
            rows="1"
            auto-grow
            readonly
          >
            <template v-slot:append>
              <v-btn @click="clear" class="ml-1" icon>
                <v-icon>$clear</v-icon>
              </v-btn>
              <v-btn icon @click="show = !show" class="ml-1" text>
                <qrcode />
              </v-btn>
              <v-btn @click="copy(address)" class="ml-1" icon>
                <v-icon>$copy</v-icon>
              </v-btn>
            </template>
          </v-textarea>
        </v-card-text>
      </v-card>
      <amount v-if="editing" @edit="editing = true" @done="done" />
      <v-card v-if="!payment.address" class="pa-4 mb-2">
        <v-textarea label="Recipient" v-model="to" rows="1" auto-grow>
          <template v-slot:append>
            <v-btn v-if="canPaste" class="mr-2 mb-2 flex-grow-1" @click="self">
              <v-icon left>$account</v-icon>
              <span>Self</span>
            </v-btn>
            <v-btn v-if="canPaste" class="mr-2 mb-2 flex-grow-1" @click="paste">
              <v-icon left>$assignment</v-icon>
              <span>Paste</span>
            </v-btn>
          </template>
        </v-textarea>
      </v-card>
      <transaction
        v-if="payment.address && !editing"
        @edit="editing = true"
        @feeRate="buildSweepTx(address)"
        :max="balance"
        :key="payment.address"
      />
      <v-btn v-if="!editing" color="green" @click="submit">
        <v-icon left>$send</v-icon><span>Sweep</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Qr from './Qr';
import { payments } from 'bitcoinjs-lib';
import Amount from './Amount';
import Transaction from './Transaction';
import Qrcode from 'vue-material-design-icons/Qrcode';
import validate from 'bitcoin-address-validation';
import Sent from './Sent';

const SATS = 100000000;

export default {
  components: { Qrcode, Qr, Amount, Transaction, Sent },
  data() {
    return {
      address: '',
      balance: 0,
      pending: 0,
      poll: null,
      editing: false,
      loading: true,
      show: false,
      to: '',
    };
  },
  mixins: [Copy],
  computed: {
    canPaste: () => navigator.clipboard,
    fiat() {
      return ((this.balance * this.rate) / SATS).toFixed(2);
    },
    ecpair: sync('ecpair'),
    error: sync('error'),
    invoice: get('invoice'),
    payment: get('payment'),
    rate: get('rate'),
    user: get('user'),
    text: get('text'),
  },
  methods: {
    async self() {
      this.invoice.network = 'bitcoin';
      this.invoice.user = this.user;

      await this.addInvoice();
      this.$nextTick(() => {
        this.to = this.invoice.address;
        this.payment.amount = this.balance;
        this.payment.address = this.to;
        this.payment.network = 'bitcoin';
        this.buildSweepTx(this.address);
      });

    },
    estimateFee: call('estimateFee'),
    addInvoice: call('addInvoice'),
    getNewAddress: call('getNewAddress'),
    buildSweepTx: call('buildSweepTx'),
    clearPayment: call('clearPayment'),
    clear() {
      this.ecpair = null;
      this.$go('/send');
    },
    done() {
      this.editing = false;
      this.buildSweepTx(this.address);
    },
    async getBalance() {
      let {
        data: {
          chain_stats: { funded_txo_sum: funded, spent_txo_sum: spent },
          mempool_stats: { funded_txo_sum: pfunded, spent_txo_sum: pspent },
        },
      } = await this.axios.get(`/electrs/address/${this.address}`);
      this.pending = pfunded - pspent;
      this.balance = funded - spent;
      if (this.pending < 0) this.balance += this.pending;
    },
    init() {
      this.to = '';
      let { publicKey: pubkey } = this.ecpair;
      let address;

      try {
        ({ address } = payments.p2wpkh({ pubkey, network: this.$network }));
      }
      catch {
        ({ address } = payments.p2pkh({ pubkey, network: this.$network }));
      } 

      this.address = address;

      this.getBalance();
      if (!this.poll) {
        this.poll = setInterval(this.getBalance, 2000);
      }
    },
    async paste() {
      this.to = await navigator.clipboard.readText();
    },
    sweep: call('sweep'),
    submit() {
      this.sweep();
    },
  },
  watch: {
    payment(n, o) {
      if (o.sent && !n.sent) this.init();
    },
    to(v) {
      if (validate(v)) {
        this.payment.address = v;
        this.payment.network = 'bitcoin';
      }
    },
  },
  beforeDestroy() {
    clearInterval(this.poll);
  },
  async mounted() {
    if (!this.ecpair || !this.ecpair.publicKey) return this.$go('/send');
    await this.clearPayment();
    this.init();
    this.loading = false;
  },
};
</script>
