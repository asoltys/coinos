<template>
  <div>
    <v-expansion-panels accordion class="mb-2">
      <v-expansion-panel v-for="a in accounts" :key="a.id">
        <v-expansion-panel-header ripple class="d-flex" expand-icon="">
          <div
            class="asset d-flex flex-grow-1"
            :class="{
              'body-1': $vuetify.breakpoint.xsOnly,
              title: !$vuetify.breakpoint.xs,
            }"
          >
            <v-icon
              v-if="a.pubkey"
              class="mr-2 my-auto"
              color="yellow"
              title="Non-Custodial"
              >$key</v-icon
            >
            <v-icon v-else class="mr-2 my-auto" color="yellow" title="Hosted"
              >$cloud</v-icon
            >
            <v-icon
              v-if="assets[a.asset] && assets[a.asset].registered"
              class="mr-2 my-auto"
              color="yellow"
              title="Registered"
              >$assignment</v-icon
            >
            <div>
              {{ a.name }}
              <v-btn
                class="toggle ml-1"
                :color="a.ticker === 'BTC' ? 'white' : '#0ae'"
                >{{ ticker(a) }}</v-btn
              >
            </div>
          </div>
          <div class="d-flex flex-wrap">
            <div
              class="flex-grow-1 text-right my-auto mr-1"
              :class="{
                title: $vuetify.breakpoint.xsOnly,
                'display-1': !$vuetify.breakpoint.xs,
              }"
            >
              {{ $format(a.balance, a.precision) }}
              <span
                v-if="a.pending"
                class="orange--text text--lighten-4"
                :class="{
                  'body-1': $vuetify.breakpoint.xsOnly,
                  title: !$vuetify.breakpoint.xs,
                }"
                >({{ $format(a.pending, a.precision) }} pending)</span
              >
            </div>
            <v-btn
              @click.prevent.stop="select(a)"
              class="flex-grow-0 my-auto elevation-1 ml-1 d-none d-sm-flex"
            >
              <v-icon title="Payments" color="yellow" left>$send</v-icon>
              Go
            </v-btn>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="text-left">
          <v-card class="pa-4" style="background: #333">
            <div v-if="registering[a.asset]">
              <h2 class="text-center white--text">Proof of Domain Ownership</h2>
              <div class="text-center">
                <p class="mt-2">
                  1. Serve the proof file at:
                </p>
                <v-card class="pa-2 mb-2 elevation-2">
                  {{ url(a) }}
                </v-card>

                <p>
                  2. Click <b>Register</b> to register the asset on the
                  <a
                    href="https://assets.blockstream.info/"
                    style="text-decoration: none"
                    >Blockstream Asset Registry</a
                  >
                </p>
              </div>
              <v-textarea
                v-if="showCode"
                :value="proof(a)"
                rows="1"
                auto-grow
              />
              <div class="d-flex flex-grow-1 mb-2">
                <v-btn
                  @click="download(filename(a), proof(a))"
                  class="flex-grow-1 mr-1"
                >
                  <v-icon left color="success">$download</v-icon
                  ><span>Proof File</span>
                </v-btn>
                <v-btn @click="copy(proof(a))" class="flex-grow-1">
                  <v-icon left>$copy</v-icon><span>Copy</span>
                </v-btn>
              </div>
              <div class="d-flex flex-grow-1" style="width: 100%">
                <v-btn @click="register(a)" class="flex-grow-1">
                  <v-icon left color="primary">$assignment</v-icon
                  ><span>Register</span>
                </v-btn>
              </div>
            </div>
            <v-form v-else @submit.prevent="submit(a)">
              <v-text-field
                label="Wallet Type"
                :value="a.pubkey ? 'Non-Custodial' : 'Hosted'"
                append-icon="$key"
                readonly
              >
                <template v-slot:append>
                  <v-icon v-if="a.pubkey" color="yellow">$key</v-icon>
                  <v-icon v-else color="yellow">$cloud</v-icon>
                </template>
              </v-text-field>
              <v-textarea
                v-if="!a.pubkey"
                label="Asset Id"
                v-model="a.asset"
                rows="1"
                auto-grow
                readonly
              >
                <template v-slot:append>
                  <v-btn @click="() => copy(a.asset)" icon class="ml-1">
                    <v-icon>$copy</v-icon>
                  </v-btn>
                </template>
              </v-textarea>
              <v-text-field label="Name" v-model="a.name" @change="change(a)" @blur="blur(a)" />
              <v-text-field
                v-if="a.asset !== BTC"
                label="Domain"
                v-model="a.domain"
                @change="change(a)"
                @blur="blur(a)"
              />
              <v-text-field
                label="Ticker"
                v-model="a.ticker"
                :readonly="a.asset === BTC"
                @change="change(a)"
                @blur="blur(a)"
              />
              <v-text-field
                label="Unit Decimal Precision (0-8)"
                v-model="a.precision"
                type="number"
                @change="change(a)"
                @blur="blur(a)"
                @input="e => limit(e, a)"
              />
              <div v-if="seeds[a.id]">
                <v-textarea
                  label="Seed"
                  :value="seeds[a.id]"
                  rows="1"
                  auto-grow
                  readonly
                @change="change(a)"
                @blur="blur(a)"
                >
                  <template v-slot:append>
                    <v-btn @click="() => copy(seeds[a.id])" icon class="ml-1">
                      <v-icon>$copy</v-icon>
                    </v-btn>
                  </template>
                </v-textarea>
                <v-text-field
                  label="Path"
                  v-model="a.path"
                  rows="1"
                  auto-grow
                  readonly
                @change="change(a)"
                @blur="blur(a)"
                />
              </div>
              <div class="d-flex justify-center mb-sm-2 flex-wrap">
                <v-btn
                  v-if="a.pubkey"
                  @click="getSeed(a)"
                  class="flex-grow-1 mr-1 mb-1 mb-sm-0 wide"
                >
                  <v-icon left color="green">$settings</v-icon>
                  <span>Wallet Details</span>
                </v-btn>
                <v-btn
                  v-if="
                    !(assets[a.asset] && assets[a.asset].registered) &&
                      a.contract
                  "
                  class="flex-grow-1 mr-1 wide mb-1 mb-sm-0 wide"
                  @click.prevent="startRegistering(a.asset)"
                >
                  <v-icon left color="blue">$assignment</v-icon>
                  <span>Register Asset</span>
                </v-btn>
                <v-btn
                  @click.prevent.stop="select(a)"
                  class="flex-grow-1 mr-1 mb-1 mb-sm-0 wide"
                >
                  <v-icon left class="yellow--text">$send</v-icon>
                  <span>Go to Wallet</span>
                </v-btn>
              </div>
              <div class="d-flex justify-center mb-sm-2 flex-wrap">
                <v-btn
                  class="flex-grow-1 mr-1 mb-1 mb-sm-0 wide"
                  @click.prevent="hide(a)"
                >
                  <v-icon left>$eye</v-icon>
                  <span>{{ a.hide ? 'Show' : 'Hide' }} Wallet</span>
                </v-btn>
                <v-btn
                  class="flex-grow-1 mr-1 mb-1 mb-sm-0 wide"
                  @click.prevent="deleteAccount(a)"
                >
                  <v-icon left color="error">$delete</v-icon>
                  <span>Delete Wallet</span>
                </v-btn>
              </div>
            </v-form>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <div class="text-center">
      <v-btn class="mx-auto mb-1 mr-2 wide" @click="$go('/')">
        <v-icon left color="blue">$payments</v-icon>
        <span>View Payments</span>
      </v-btn>
      <v-btn class="mx-auto mb-1 mr-2 wide" @click="$go('/wallet')">
        <v-icon left color="primary">$add</v-icon>
        <span>New Wallet</span>
      </v-btn>
      <v-btn class="mx-auto mb-1 mr-2 wide" @click="$go('/asset')">
        <v-icon left color="green">$assignment</v-icon>
        <span>Issue New Asset</span>
      </v-btn>
      <v-btn
        v-if="user.accounts.filter(a => a.hide).length"
        class="mx-auto mb-1 wide"
        @click="showHidden = !showHidden"
      >
        <v-icon left>$eye</v-icon>
        <span>{{ showHidden ? 'Hide' : 'Show' }} Hidden</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { get, sync, call } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import cryptojs from 'crypto-js';

const BTC = process.env.VUE_APP_LBTC;
const {
  AES: aes,
  enc: { Utf8 },
} = cryptojs;

export default {
  mixins: [Copy],
  computed: {
    error: sync('error'),
    password: get('password'),
    success: sync('success'),
    accounts() {
      let { accounts } = this.user;
      return accounts.filter(a => !a.hide || this.showHidden);
    },
    assets: get('assets'),
    user: sync('user'),
  },
  data: () => ({
    changed: {},
    seeds: {},
    showHidden: false,
    showCode: false,
    BTC,
    registering: {},
    panels: {
      Hosted: [],
      'Non-Custodial': [],
    },
  }),
  methods: {
    change(a) {
      this.changed[a.id] = true;
    },
    ticker(a) {
      return a.ticker || a.asset.substr(0, 3);
    },
    deleteAccount: call('deleteAccount'),
    passwordPrompt: call('passwordPrompt'),
    hide(a) {
      this.showHidden = false;
      a.hide = !a.hide;
      this.updateAccount(a);
    },
    url(a) {
      return `https://${a.contract.entity.domain}/.well-known/${this.filename(
        a
      )}`;
    },
    proof(a) {
      return `Authorize linking the domain name ${a.contract.entity.domain} to the Liquid asset ${a.asset}`;
    },
    filename(a) {
      return `liquid-asset-proof-${a.asset}`;
    },
    download(filename, text) {
      const blob = new Blob([text], {
        type: 'application/octet-stream;charset=utf-8;',
      });
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
      } else {
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    },
    limit(e, a) {
      if (e < 0) this.$nextTick(() => (a.precision = 0));
      if (e > 8) this.$nextTick(() => (a.precision = 8));
    },
    blur(a) {
      if (this.changed[a.id]) {
        this.changed[a.id] = false;
        this.submit(a, true);
      }
    }, 
    async submit(a, supress) {
      await this.updateAccount(a);
      if (!supress) this.success = 'Account updated successfully';
    },
    registerAsset: call('registerAsset'),
    shiftAccount: call('shiftAccount'),
    updateAccount: call('updateAccount'),
    async getSeed(a) {
      if (this.seeds[a.id]) return (this.seeds[a.id] = null);
      let { password } = this;
      if (!password) ({ password } = await this.passwordPrompt());
      const seed = aes.decrypt(a.seed, password).toString(Utf8);
      if (!seed) this.error = 'Unable to decrypt account seed';
      this.$set(this.seeds, a.id, seed);
    },
    startRegistering(a) {
      this.$set(this.registering, a, true);
    },
    async register(a) {
      await this.registerAsset(a.asset);
      this.select(a);
    },
    async select(a) {
      await this.shiftAccount(a.id);
      this.$go('/home');
    },
  },
};
</script>

<style lang="stylus" scoped>
.asset
  max-width 70%
  word-wrap break-word

.toggle
  color black
  max-height 24px
  margin-bottom 2px
  min-width 44px !important
</style>
