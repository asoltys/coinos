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
      <v-btn-toggle
        v-model="type"
        tile
        color="primary accent-3"
        group
        class="d-flex"
        mandatory
      >
        <v-btn value="Non-Custodial" class="flex-grow-1">
          <v-icon class="ma-2 my-auto" color="primary" title="Non-Custodial"
            >$key</v-icon
          >
          Non-Custodial
        </v-btn>
        <v-btn value="Hosted" class="flex-grow-1">
          <v-icon class="ma-2 my-auto" color="primary" title="Hosted"
            >$cloud</v-icon
          >
          Hosted
        </v-btn>
      </v-btn-toggle>

      <v-btn-toggle
        v-model="account.network"
        tile
        color="primary accent-3"
        group
        class="d-flex mb-2"
        v-if="type !== 'Hosted'"
      >
        <v-btn value="bitcoin" class="flex-grow-1">
          <img class="ma-2" src="../assets/bitcoin.png" width="22px" />
          Bitcoin
        </v-btn>
        <v-btn value="liquid" class="flex-grow-1" disabled>
          <v-icon class="ma-2 my-auto" color="liquid" title="Liquid"
            >$liquid</v-icon
          >
          Liquid
        </v-btn>
      </v-btn-toggle>
      <div v-if="type === 'Hosted'">
        <v-autocomplete
          label="Asset Lookup"
          v-model="account.asset"
          :items="all"
        >
          <template v-slot:item="{ item }">
            <v-list-item-content>
              <v-list-item-title v-text="item.text"></v-list-item-title>
              <v-list-item-subtitle v-text="item.value"></v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-avatar>
                <img
                  v-if="icons[item.value]"
                  class="ma-2"
                  :src="`data:image/png;base64, ${icons[item.value]}`"
                />
              </v-avatar>
            </v-list-item-action>
          </template>
        </v-autocomplete>
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
      <div v-if="type === 'Non-Custodial'">
        <div v-if="details">
          <v-textarea
            label="Seed"
            v-model="account.seed"
            rows="1"
            auto-grow
            :loading="loading"
          >
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
          <v-icon left color="pink">$settings</v-icon>
          <span>Advanced Settings</span>
        </v-btn>
        <v-btn type="submit" class="wide">
          <v-icon left class="primary--text">$send</v-icon>
          <span>Go</span>
        </v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script>
import { call, get } from 'vuex-pathify';
import icons from '../icons.json';
import Copy from '../mixins/Copy';
import { generateMnemonic, mnemonicToSeed } from 'bip39';
import { fromSeed, fromBase58 } from 'bip32';
import sha256, { HMAC } from 'fast-sha256';

const btc = process.env.VUE_APP_LBTC;

export default {
  mixins: [Copy],

  data: () => ({
    icons,
    root: null,
    loading: false,
    type: 'Non-Custodial',
    details: false,
    success: false,
    account: {
      asset: btc,
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
    accountPath() {
      return this.account.path;
    },
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
      if (!v) return;
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
      if (!(v && this.root)) return;
      try {
        this.account.privkey = this.root.derivePath(v).toBase58();
      } catch (e) {}
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
        this.account.pubkey = null;
        this.account.privkey = null;
        this.account.seed = null;
        this.account.path = null;
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
