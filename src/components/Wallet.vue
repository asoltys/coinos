<template>
  <v-card class="pa-4">
    <h1>New Wallet</h1>
    <v-alert
      v-if="success"
      class="mb-4"
      color="success"
      icon="$info"
      v-model="success"
      dismissible
      transition="scale-transition"
      dark
    >
      Settings saved successfully
    </v-alert>
    <v-form @submit.prevent="submit">
      <v-combobox
        v-model="type"
        :items="['Hosted', 'Non-Custodial']"
        label="Account Type"
      >
        <template v-slot:selection="data">
          <v-icon
            v-if="data.item === 'Non-Custodial'"
            class="mr-2 my-auto"
            color="yellow"
            title="Non-Custodial"
            >$key</v-icon
          >
          <v-icon v-else class="mr-2 my-auto" color="yellow" title="Hosted"
            >$cloud</v-icon
          >
          <span class="text--white">{{ data.item }}</span>
        </template>
      </v-combobox>
      <v-select
        v-if="type !== 'Hosted'"
        label="Network"
        v-model="account.network"
        :items="networks"
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
      <div v-if="type === 'Hosted'">
        <v-autocomplete
          label="Asset Lookup"
          v-model="account.asset"
          :items="all"
        />
        <v-textarea
          v-if="!account.pubkey"
          label="Asset Id"
          :value="account.asset"
          rows="1"
          auto-grow
        >
          <template v-slot:append>
            <v-btn @click="() => copy(account.asset)" icon class="ml-1">
              <v-icon>$copy</v-icon>
            </v-btn>
          </template>
        </v-textarea>
      </div>
      <v-text-field label="Asset Name (optional)" v-model="account.name" />
      <v-text-field label="Ticker Symbol (optional)" v-model="account.ticker" />
      <v-text-field
        label="Unit Decimal Precision (0-8)"
        v-model="account.precision"
        type="number"
        @input="e => limit(e, a)"
      />
      <div v-if="type === 'Non-Custodial'">
        <div v-if="details">
          <v-textarea label="Seed" v-model="account.seed" rows="1" auto-grow :loading="loading">
            <template v-slot:append>
              <v-btn @click="copy(account.seed)" class="ml-1" icon>
                <v-icon>$copy</v-icon>
              </v-btn>
              <v-btn icon @click="generate" class="ml-1" text>
                <v-icon>$refresh</v-icon>
              </v-btn>
            </template>
          </v-textarea>
          <v-text-field
            label="Path"
            v-model="account.path"
            rows="1"
            auto-grow
          />
          <v-textarea
            label="Master Pubkey"
            v-model="account.pubkey"
            rows="1"
            auto-grow
          >
            <template v-slot:append>
              <v-btn @click="copy(account.pubkey)" class="ml-1" icon>
                <v-icon>$copy</v-icon>
              </v-btn>
            </template>
          </v-textarea>
          <v-textarea
            label="Master Private Key"
            type="password"
            v-model="account.privkey"
            rows="1"
            auto-grow
          >
            <template v-slot:append>
              <v-btn @click="copy(account.privkey)" class="ml-1" icon>
                <v-icon>$copy</v-icon>
              </v-btn>
            </template>
          </v-textarea>
        </div>
      </div>
      <div class="text-right">
        <v-btn
          v-if="type === 'Non-Custodial'"
          @click="details = !details"
          class="mr-1 mb-1 mb-sm-0 wide"
        >
          <v-icon left color="green">$settings</v-icon>
          <span>Wallet Details</span>
        </v-btn>
        <v-btn type="submit" class="wide">
          <v-icon left class="yellow--text">$send</v-icon>
          <span>Go</span>
        </v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script>
import { call, get } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import { generateMnemonic, mnemonicToSeed } from 'bip39';
import { fromSeed, fromBase58 } from 'bip32';
import sha256, { HMAC } from 'fast-sha256';

export default {
  mixins: [Copy],

  data: () => ({
    root: null,
    loading: false,
    type: 'Non-Custodial',
    details: false,
    success: false,
    account: {
      asset: process.env.VUE_APP_LBTC,
      name: 'Bitcoin',
      ticker: 'BTC',
      precision: 8,
      seed: '',
      path: `m/84'/0'/0'`,
      network: 'bitcoin',
      privkey: '',
      pubkey: '',
    },
    timeout: null,
  }),

  computed: {
    accountPath() { return this.account.path },
    network() {
      return this.account.network;
    },
    nodes: get('nodes'),
    networks() {
      return this.nodes
        .filter(n => n !== 'lightning')
        .map(n => ({
          text: n[0].toUpperCase() + n.slice(1),
          value: n,
        }));
    },
    seed: get('seed'),
    asset() {
      return this.account.asset;
    },
    assets: get('assets'),
    all() {
      return Object.keys(this.assets)
        .map(asset => ({
          text: `${this.assets[asset].ticker} - ${this.assets[asset].name}`,
          value: asset,
        }))
        .sort((a, b) => ('' + a.text).localeCompare(b.text));
    },
    accountSeed() {
      return this.account.seed;
    },
    accountPrivkey() {
      return this.account.privkey;
    },
    user: get('user'),
  },

  methods: {
    passwordPrompt: call('passwordPrompt'),
    generate() {
      this.account.seed = generateMnemonic();
    },

    createAccount: call('createAccount'),

    issueAsset: call('issueAsset'),
    submit() {
      this.createAccount(this.account);
    },
    limit(e) {
      if (e < 0) this.$nextTick(() => (this.account.precision = 0));
      if (e > 8) this.$nextTick(() => (this.account.precision = 8));
      this.$nextTick(() => (this.account.precision = Math.round(e)));
    },
    async setupKeys() {
      const waitForUser = resolve => {
        if (!this.user.index && this.user.index !== 0)
          return (this.timeout = setTimeout(() => waitForUser(resolve), 1000));
        resolve();
      };
      await new Promise(waitForUser);
      let { seed } = this;
      if (!seed) ({ seed } = await this.passwordPrompt());
      this.account.seed = seed;
      this.account.path += '/' + this.user.index;
      this.generate();
    },
  },
  watch: {
    accountPrivkey(v) {
      this.account.pubkey = fromBase58(v, this.$network) 
        .neutered()
        .toBase58();
    },

    async accountSeed(v) {
      if (!v) return;
      this.loading = true;
      this.root = fromSeed(await mnemonicToSeed(v), this.$network);
      this.account.privkey = this.root.derivePath(this.account.path).toBase58();
      this.loading = false;
    },

    accountPath(v) {
      if (!this.root) return;
      try {
        this.account.privkey = this.root.derivePath(v).toBase58();
      } catch(e) {} 
    },

    network(v) {
      if (v === 'bitcoin' && this.account.ticker === 'LBTC')
        this.account.ticker = 'BTC';
      if (v === 'liquid' && this.account.ticker === 'BTC')
        this.account.ticker = 'LBTC';

      if (v === 'bitcoin' && this.account.name === 'Liquid Bitcoin')
        this.account.name = 'Bitcoin';
      if (v === 'liquid' && this.account.name === 'Bitcoin')
        this.account.name = 'Liquid Bitcoin';
    },
    type(v) {
      if (v === 'Hosted') {
        this.account.seed = '';
        this.account.path = `m/84'/0'/0'`;
      } else this.setupKeys();
    },

    asset(v) {
      this.account = { ...this.account, ...this.assets[v] };
    },
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  mounted() {
    this.setupKeys();
  },
};
</script>
