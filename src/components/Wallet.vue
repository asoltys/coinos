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
      <v-text-field label="Name" v-model="account.name" rows="1" auto-grow />
      <v-combobox
        v-model="account.type"
        :items="['Custodial', 'Non-Custodial']"
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
      <div v-if="account.type === 'Non-Custodial'">
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
        <v-text-field label="Path" v-model="account.path" rows="1" auto-grow />
        <v-text-field label="Pubkey" v-model="pubkey" rows="1" auto-grow />
        <v-text-field label="Privkey" v-model="privkey" rows="1" auto-grow />
      </div>
      <v-autocomplete v-else label="Asset" v-model="asset" :items="all" />
      <div class="text-right">
        <v-btn type="submit">
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
    asset: process.env.VUE_APP_LBTC,
    success: false,
    account: {
      name: 'Bitcoin',
      type: 'Non-Custodial',
      seed: '',
      path: `m/84'/0'/0'/0`,
    },
  }),

  computed: {
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
      const root = fromSeed(
        Buffer.from(sha256(this.account.seed), 'hex'),
        this.$network
      );
      return root.derivePath(this.account.path).toBase58();
    },
    pubkey() {
      const root = fromSeed(
        Buffer.from(sha256(this.account.seed), 'hex'),
        this.$network
      );
      return root
        .derivePath(this.account.path)
        .neutered()
        .toBase58();
    },
  },

  methods: {
    generate() {
      this.account.seed = generateMnemonic();
    },

    addAccount: call('addAccount'),

    issueAsset: call('issueAsset'),
    submit() {
      this.addAccount(this.account);
    },
    limit(e) {
      if (e < 0) this.$nextTick(() => (this.asset.precision = 0));
      if (e > 8) this.$nextTick(() => (this.asset.precision = 8));
      this.$nextTick(() => (this.asset.precision = Math.round(e)));
    },
  },
  mounted() {
    this.generate();
  },
};
</script>
