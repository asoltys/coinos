<template>
  <v-form class="pa-4">
    <amount
      v-show="showAmount"
      v-model.number="invoice.amount"
      class="mb-2"
      @input="updateAmount"
      @done="submit"
      :triggerEditing="showAmount"
      @cancel="showAmount = false"
      :show="false"
    />
    <amount
      v-if="invoice.tip"
      v-model.number="invoice.tip"
      label="Tip"
      class="mb-2"
      @input="updateTip"
      @done="submit"
    />
    <v-textarea
      v-if="showMemo"
      label="Memo"
      v-model="invoice.memo"
      rows="1"
      ref="memo"
      auto-grow
      auto-focus
      @input="dirtyMemo = true"
      @keydown.enter.prevent="submit"
    >
      <template v-slot:append>
        <v-btn v-if="dirtyMemo" class="toggle" @click="submit">
          <v-icon left color="success">$check</v-icon> Apply
        </v-btn>
      </template>
    </v-textarea>
    <div v-if="settings">
      <v-template v-if="invoice.network !== 'lightning'">
        <v-select
          label="Address Type"
          :items="addressTypes"
          v-model="type"
          @input="submit"
        />
        <v-template v-if="type === 'legacy'">
          <div v-if="signedMessage" class="py-4">{{ signedMessage }}</div>
          <v-template v-else>
            <v-text-field label="Message to Sign" v-model="message" />
            <v-btn class="toggle" @click="signMessage">
              <v-icon left color="success">$pencil</v-icon> Sign Message
            </v-btn>
          </v-template>
        </v-template>
      </v-template>
      <v-text-field
        v-if="user.account.pubkey"
        label="Derivation Path"
        v-model="path"
        @input="dirtyPath = true"
      >
        <template v-slot:append>
          <v-btn v-if="dirtyPath" class="toggle" @click="submit">
            <v-icon left color="success">$check</v-icon> Apply
          </v-btn>
        </template>
      </v-text-field>
      <div class="d-flex mb-sm-1"></div>
    </div>
    <v-btn-toggle tile color="primary accent-3" group class="flex-wrap mx-auto">
      <v-btn @click.native="toggleAmount" class="flex-grow-1">
        <v-icon left color="primary">$edit</v-icon>
        Amount
      </v-btn>
      <v-btn v-if="!showMemo" @click.native="toggleMemo" class="flex-grow-1">
        <v-icon left color="blue">$note</v-icon>
        Memo
      </v-btn>
      <v-btn @click="copy(text)" class="flex-grow-1">
        <v-icon left>$copy</v-icon>
        Copy
      </v-btn>
      <v-btn @click="$emit('display')" class="flex-grow-1">
        <v-icon left color="green">$qrcode</v-icon>
        Show QR
      </v-btn>
      <v-btn
        v-if="network !== 'lightning'"
        @click="settings = !settings"
        class="flex-grow-1"
      >
        <v-icon left color="pink">$settings</v-icon>
        Address
      </v-btn>
      <v-btn
        v-if="!lnurl && network === 'lightning'"
        @click.native="getPaymentUrl"
        class="flex-grow-1"
      >
        <v-icon left color="primary">$flash</v-icon>
        LNURL
      </v-btn>
    </v-btn-toggle>
  </v-form>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Amount from './Amount';

export default {
  components: { Amount },
  mixins: [Copy],
  props: {
    clear: { type: Function },
  },

  data: () => ({
    dirtyPath: false,
    dirtyMemo: false,
    showAmount: false,
    showMemo: false,
    settings: false,
    grow: false,
    fab: false,
    showcode: false,
    types: ['bech32', 'p2sh-segwit', 'legacy'],
  }),

  computed: {
    addressTypes() {
      return this.network === 'liquid' ? ['bech32', 'unconfidential'] : this.user.account.pubkey ? this.types : [...this.types, 'bech32m'];
    },
    signedMessage: get('signedMessage'),
    message: sync('message'),
    loading: get('loading'),
    networks() {
      return this.nodes
        .filter(
          (n) =>
            (!this.user.account.pubkey &&
              (this.user.account.asset === process.env.VUE_APP_LBTC ||
                n === 'liquid')) ||
            this.user.account.network === n
        )
        .map((n) => ({
          text: n[0].toUpperCase() + n.slice(1),
          value: n,
        }));
    },
    nodes: get('nodes'),
    text() {
      return this.loading ? "" : (this.type === "unconfidential" ? this.invoice.unconfidential : this.invoice.address) || this.invoice.text;
    },
    lnurl: sync('lnurl'),
    invoice: sync('invoice'),
    path: sync('invoice@path'),
    type: sync('invoice@addressType'),
    user: get('invoice@user'),
    amount: get('invoice@amount'),
    network: get('invoice@network'),
  },

  methods: {
    toggleSettings() {
      this.settings = !this.settings;
      this.grow = this.settings;
    },
    toggleAmount() {
      this.showAmount = !this.showAmount;
      if (!this.showAmount) {
        this.submit();
        this.invoice.amount = null;
      }
    },
    async submit() {
      this.dirtyPath = false;
      this.dirtyMemo = false;
      this.addInvoice();
      this.showAmount = false;
      this.showMemo = false;
    },
    toggleMemo() {
      this.showMemo = !this.showMemo;
      this.$nextTick(() => {
        if (this.showMemo) this.$refs.memo.focus();
        else {
          this.invoice.memo = '';
          this.submit();
        }
      });
    },
    setCurrency: call('setCurrency'),

    updateAmount(amount, fiatAmount, currency) {
      this.setCurrency(currency);
      this.$nextTick(() => {
        this.invoice.amount = amount;
        this.invoice.fiatAmount = fiatAmount;
      });
    },

    updateTip(amount, fiatAmount, currency) {
      this.setCurrency(currency);
      this.$nextTick(() => {
        this.invoice.tip = amount;
        this.invoice.fiatTip = fiatAmount;
      });
    },

    signMessage: call('signMessage'),
    addInvoice: call('addInvoice'),
    getPaymentUrl: call('getPaymentUrl'),
    getNewAddress() {
      const { path } = this.invoice;
      this.user.account.index++;
      let index = parseInt(path[path.length - 1]);
      this.path = path.replace(/.$/, ++index);
      this.submit();
    },
  },
};
</script>

<style lang="stylus" scoped>
.toggle
  margin auto 0.25rem !important
  margin-top -0.3rem !important
  height 1.7rem !important

>>>.v-textarea textarea
  overflow hidden
</style>
