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
              v-if="assets[a.asset].registered"
              class="mr-1"
              color="yellow"
              title="Registered"
              >$assignment</v-icon
            >
            <div class="mb-1">
              {{ a.name }} <span v-if="a.pubkey">(non-custodial)</span>
              <v-btn
                class="toggle ml-1"
                :color="a.ticker === 'BTC' ? 'white' : '#0ae'"
                >{{ a.ticker }}</v-btn
              >
            </div>
          </div>
          <div class="d-flex flex-wrap">
            <div
              class="flex-grow-1 text-right my-auto mr-1"
              :class="{
                'title': $vuetify.breakpoint.xsOnly,
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
            <v-btn @click.prevent.stop="select(a)" class="flex-grow-0 ml-auto my-auto black--text" color="yellow">
              <v-icon>$forward</v-icon>
            </v-btn>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="text-left">
          <v-card class="pa-4" style="background: #333">
            <v-alert
              v-if="success[a.asset]"
              class="mb-4"
              color="success"
              icon="$info"
              v-model="success[a.asset]"
              dismissible
              transition="scale-transition"
              dark
            >
              Settings saved successfully
            </v-alert>
            <div v-if="registering[a.asset]">
              <h2 class="text-center white--text">Proof of Domain</h2>
              <div class="text-center">
                Place file at <a :href="url(a)">{{ url(a) }}</a> and click
                Register
              </div>
              <div class="d-flex">
                <div class="flex-grow-1 text-center">
                  <v-icon large @click="showcode = !showcode" class="pa-4"
                    >$assignment</v-icon
                  >
                </div>
              </div>
              <v-textarea
                v-if="showcode"
                :value="proof(a)"
                rows="1"
                auto-grow
              />
              <div class="d-flex flex-grow-1 mb-2">
                <v-btn
                  @click="download(filename(a), proof(a))"
                  class="flex-grow-1 mr-1"
                >
                  <v-icon left>$download</v-icon><span>Download</span>
                </v-btn>
                <v-btn @click="copy(proof(a))" class="flex-grow-1">
                  <v-icon left>$copy</v-icon><span>Copy</span>
                </v-btn>
              </div>
              <div class="d-flex flex-grow-1" style="width: 100%">
                <v-btn
                  @click="register(a)"
                  color="yellow"
                  class="black--text flex-grow-1"
                >
                  <v-icon left>$assignment</v-icon><span>Register</span>
                </v-btn>
              </div>
            </div>
            <v-form v-else @submit.prevent="() => submit(a)">
              <v-textarea
                label="Id"
                :value="a.asset"
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
              <v-text-field
                label="Name"
                v-model="a.name"
                :readonly="a.asset === BTC"
              />
              <v-text-field
                v-if="a.asset !== BTC"
                label="Domain"
                v-model="a.domain"
              />
              <v-text-field
                label="Ticker"
                v-model="a.ticker"
                :readonly="a.asset === BTC"
              />
              <v-text-field
                label="Precision"
                v-model="a.precision"
                type="number"
                @input="e => limit(e, a)"
                :readonly="a.asset === BTC"
              />
              <div class="text-right">
                <v-btn type="submit" class="mr-1">
                  <v-icon left class="yellow--text">$check</v-icon>
                  <span>save</span>
                </v-btn>
                <v-btn class="mr-1" @click.prevent="archive(a)" v-if="a.ticker !== 'BTC'">
                  <v-icon left>$archive</v-icon>
                  <span>{{ a.hide ? 'Unarchive' : 'Archive' }}</span>
                </v-btn>
                <v-btn
                  v-if="!assets[a.asset].registered && a.contract"
                  class="mr-1"
                  @click.prevent="startRegistering(a.asset)"
                >
                  <v-icon left>$assignment</v-icon>
                  <span>Register</span>
                </v-btn>
              </div>
            </v-form>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-btn
      class="mx-auto mb-2 black--text mr-2"
      @click="$go('/asset')"
      color="yellow"
    >
      <v-icon>$add</v-icon>
      <span>New</span>
    </v-btn>
    <v-btn
      v-if="!showArchived && user.accounts.filter(a => a.hide).length"
      class="mx-auto mb-2"
      @click="showArchived = true"
    >
      <v-icon>$archive</v-icon>
      <span>Show Archived</span>
    </v-btn>
  </div>
</template>

<script>
import { get, sync, call } from 'vuex-pathify';
import Copy from '../mixins/Copy';
const BTC = process.env.VUE_APP_LBTC;

export default {
  mixins: [Copy],
  computed: {
    accounts() {
      let { accounts } = this.user;
      return accounts
        .sort((a, b) => ('' + a.ticker).localeCompare(b.ticker))
        .sort((a, b) => a.ticker === 'BTC' ? -1 : 1)
        .sort((a, b) => {
          if (a.pubkey && !b.pubkey) return -1;
          return 1;
        })
        .filter(a => (!a.hide || this.showArchived) && this.assets[a.asset]);
    },
    assets: get('assets'),
    user: sync('user'),
  },
  data() {
    return {
      showArchived: false,
      showcode: false,
      BTC,
      registering: {},
      success: {},
    };
  },
  methods: {
    archive(a) {
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
    async submit(a) {
      try {
        await this.updateAccount(a);
        this.$set(this.success, a.asset, true);
      } catch (e) {
        this.$set(this.success, a.asset, false);
      }
    },
    registerAsset: call('registerAsset'),
    shiftAccount: call('shiftAccount'),
    updateAccount: call('updateAccount'),
    async startRegistering(a) {
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
