<template>
  <div>
    <v-select
      label="Network"
      v-model="invoice.network"
      :items="networks"
      @change="submit"
    >
      <template v-slot:selection="data">
        <v-icon
          class="ma-2 my-auto"
          color="primary"
          title="Lightning"
          v-if="data.item.text === 'Lightning'"
          >$flash</v-icon
        >
        <v-icon
          class="ma-2 my-auto"
          color="#00aaee"
          title="Lightning"
          v-if="data.item.text === 'Liquid'"
          >$water</v-icon
        >
        <img
          class="ma-2"
          src="../assets/bitcoin.png"
          width="22px"
          v-if="data.item.text === 'Bitcoin'"
        />
        <span class="text--white">{{ data.item.text }}</span>
      </template>
    </v-select>
    <amount
      v-if="showAmount || invoice.amount"
      v-model.number="invoice.amount"
      class="mb-2"
      @input="updateAmount"
      @done="submit"
      :startEditing="!invoice.amount"
    />
    <amount
      v-if="invoice.tip || invoice.tip === 0"
      v-model.number="invoice.tip"
      label="Tip"
      class="mb-2"
      @input="updateTip"
      @done="submit"
    />
    <v-textarea
      :label="invoice.network === 'lightning' ? 'Invoice' : 'Address'"
      :loading="loading"
      v-model="text"
      class="my-auto readonly"
      rows="1"
      :auto-grow="invoice.network !== 'lightning' || grow"
      style="overflow: hidden"
      readonly
      :key="grow"
    >
      <template v-slot:append>
        <v-btn
          v-if="invoice.network !== 'lightning'"
          icon
          @click.native="toggleSettings"
        >
          <v-icon>$settings</v-icon>
        </v-btn>
        <v-btn @click="copy(text)" icon title="Copy">
          <v-icon>$copy</v-icon>
        </v-btn>
        <v-btn
          v-if="invoice.network === 'lightning' && !grow"
          @click="grow = true"
          title="Expand"
          icon
        >
          <v-icon>$unfold_more</v-icon>
        </v-btn>
        <v-btn
          v-if="invoice.network !== 'lightning'"
          @click="getNewAddress()"
          title="New Address"
          icon
        >
          <v-icon>$refresh</v-icon>
        </v-btn>
      </template>
    </v-textarea>
    <v-textarea
      v-if="invoice.memo || showMemo"
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
      <v-select
        v-if="invoice.network !== 'lightning'"
        label="Address Type"
        :items="types"
        v-model="type"
        @input="submit"
      />
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
      <div class="d-flex mb-sm-1">
        <v-btn
          v-if="!lnurl && invoice.network === 'lightning'"
          @click.native="getPaymentUrl"
          class="flex-grow-1 wide mr-2 mb-1 mb-sm-0"
        >
          <v-icon left color="primary">$qrcode</v-icon>
          LNURL Pay Request
        </v-btn>
      </div>
    </div>
    <div class="d-flex flex-wrap mb-sm-1">
      <v-btn @click="copy(invoice.text)" class="flex-grow-1 wide mb-1 mb-sm-0">
        <v-icon left>$copy</v-icon>
        Copy
      </v-btn>
    </div>
    <div class="d-flex flex-wrap mb-sm-1">
      <v-btn
        v-if="!showAmount && !invoice.amount"
        @click.native="toggleAmount"
        class="flex-grow-1 wide mr-1 mb-1 mb-sm-0"
      >
        <v-icon left color="pink">$edit</v-icon>
        Set Amount
      </v-btn>
      <v-btn
        v-if="!showMemo"
        @click.native="toggleMemo"
        class="flex-grow-1 wide mb-1 mb-sm-0"
      >
        <v-icon left color="green">$note</v-icon>
        Add Memo
      </v-btn>
    </div>
    <div class="d-flex flex-wrap">
      <v-btn @click="$emit('lock')" class="flex-grow-1 mb-1 mb-sm-0 wide">
        <v-icon left color="blue">$eye</v-icon>
        Display
      </v-btn>
    </div>
  </div>
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
    loading: get('loading'),
    networks() {
      return this.nodes
        .filter(
          n => !this.user.account.pubkey && (this.user.account.asset === process.env.VUE_APP_LBTC || n === 'liquid') || this.user.account.network === n
        )
        .map(n => ({
          text: n[0].toUpperCase() + n.slice(1),
          value: n,
        }));
    },
    nodes: get('nodes'),
    text() {
      return this.loading ? '' : this.invoice.address || this.invoice.text;
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
