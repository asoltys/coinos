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
      <v-text-field label="Name" v-model="account.name" />
      <v-text-field label="Ticker" v-model="account.ticker" />
      <v-text-field
        label="Precision"
        v-model="account.precision"
        type="number"
        @input="e => limit(e, a)"
      />
      <div v-if="type === 'Non-Custodial'">
        <div v-if="details">
          <v-textarea label="Seed" v-model="account.seed" rows="1" auto-grow>
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
          <v-textarea label="Master Pubkey" v-model="pubkey" rows="1" auto-grow>
            <template v-slot:append>
              <v-btn @click="copy(account.pubkey)" class="ml-1" icon>
                <v-icon>$copy</v-icon>
              </v-btn>
            </template>
          </v-textarea>
          <v-textarea
            label="Master Private Key"
            type="password"
            v-model="privkey"
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
        <v-btn v-if="type === 'Non-Custodial'" @click="details = !details" class="mr-1 mb-1 mb-sm-0 wide">
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
import { generateMnemonic } from 'bip39';
import { fromSeed } from 'bip32';
import sha256, { HMAC } from 'fast-sha256';

export default {
  mixins: [Copy],

  data: () => ({
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
    },
    timeout: null,
  }),

  computed: {
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
    privkey() {
      if (!this.account.seed) return null;
      const root = fromSeed(
        Buffer.from(sha256(this.account.seed), 'hex'),
        this.$network
      );
      return root.derivePath(this.account.path).toBase58();
    },
    pubkey() {
      if (!this.account.seed) return null;
      const root = fromSeed(
        Buffer.from(sha256(this.account.seed), 'hex'),
        this.$network
      );
      return root
        .derivePath(this.account.path)
        .neutered()
        .toBase58();
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
      this.account.pubkey = this.pubkey;
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
        return this.timeout = setTimeout(() => waitForUser(resolve), 1000);
      resolve();
    };
    await new Promise(waitForUser);
    let { seed } = this;
    if (!seed) ({ seed } = await this.passwordPrompt());
    this.account.seed = seed;
    this.account.path += '/' + this.user.index;
    } 
  },
  watch: {
    type(v) {
      if (v === 'Hosted') {
        this.account.seed = '';
        this.account.path = `m/84'/0'/0'`;
      } 
      else this.setupKeys();
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
