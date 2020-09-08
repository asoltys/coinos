<template>
  <div>
    <v-progress-linear
      v-if="initializing || loading || !user.payments"
      indeterminate
    />
    <template v-else>
      <div v-if="filteredPayments().length">
        <v-expansion-panels accordion>
          <v-expansion-panel
            v-for="{
              account,
              color,
              confirmed,
              createdAt,
              currency,
              displayAmount: amount,
              displayFee: fee,
              fiat,
              hash,
              id,
              link,
              memo,
              network,
              payobj,
              preimage,
              sign,
              tip,
              updatedAt,
            } in filteredPayments()"
            :key="id"
          >
            <v-expansion-panel-header
              ripple
              class="justify-center justify-space-around flex-wrap"
              expand-icon=""
            >
              <network-icon class="flex-grow-0 mr-2 mt-1" :network="network" />
              <div class="flex-grow-1" style="white-space: nowrap;">
                <span
                  :class="{
                    'body-1': $vuetify.breakpoint.xsOnly,
                    headline: !$vuetify.breakpoint.xs,
                  }"
                >
                  <span :class="color">{{ sign }}</span>
                  {{ amount }}
                </span>

                <span>{{ ticker(account) }}</span>
                <div v-if="account.ticker === 'BTC'">
                  <span class="yellow--text">
                    {{ fiat | abs | twodec }}
                    <span v-if="tip">(+{{ tip }})</span>
                    {{ currency }}
                  </span>
                </div>
              </div>
              <div
                class="text-right"
                :class="{
                  'body-2': $vuetify.breakpoint.xsOnly,
                  'subtitle-2': !$vuetify.breakpoint.xs,
                }"
              >
                <v-chip v-if="!confirmed" color="red" class="mr-2">
                  <v-icon left class="d-none d-sm-inline">$alert</v-icon>
                  <v-icon class="d-sm-none">$alert</v-icon>
                  <span class="d-none d-sm-inline" title="UNCONFIRMED"
                    >UNCONFIRMED</span
                  >
                </v-chip>
                {{ updatedAt | format }}
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content class="text-left">
              <v-card class="pa-4" style="background: #333">
                <v-textarea
                  label="Payment Hash"
                  :value="hash"
                  readonly
                  rows="1"
                  auto-grow
                >
                  <template v-slot:append>
                    <v-btn v-if="link" @click="explore(link)" class="ml-1" icon>
                      <v-icon>$open</v-icon>
                    </v-btn>
                    <v-btn @click="copy(hash)" class="ml-1" icon>
                      <v-icon>$copy</v-icon>
                    </v-btn>
                  </template>
                </v-textarea>
                <v-text-field label="Amount" :value="amount" readonly>
                  <template v-slot:append>
                    <v-btn @click="copy(amount)" class="ml-1" icon>
                      <v-icon>$copy</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
                <v-textarea
                  v-if="fee"
                  label="Fee"
                  :value="fee"
                  readonly
                  rows="1"
                  auto-grow
                >
                  <template v-slot:append>
                    <v-btn @click="copy(fee)" class="ml-1" icon>
                      <v-icon>$copy</v-icon>
                    </v-btn>
                  </template>
                </v-textarea>
                <v-textarea
                  v-if="preimage"
                  label="Preimage"
                  :value="preimage"
                  readonly
                  rows="1"
                  auto-grow
                >
                  <template v-slot:append>
                    <v-btn @click="copy(preimage)" class="ml-1" icon>
                      <v-icon>$copy</v-icon>
                    </v-btn>
                  </template>
                </v-textarea>
                <v-textarea
                  v-if="memo"
                  label="Memo"
                  :value="memo"
                  rows="1"
                  auto-grow
                  :ref="'memo' + id"
                  :success="success[id]"
                  :readonly="success[id]"
                >
                  <template v-slot:append>
                    <v-btn
                      v-if="!success[id]"
                      @click="updateMemo(id)"
                      class="ml-1 mb-1"
                      color="secondary"
                    >
                      <v-icon left>$update</v-icon>
                      Save
                    </v-btn>
                  </template>
                </v-textarea>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <div class="my-2 d-flex flex-wrap">
          <v-btn
            class="flex-grow-1 mr-2 mb-2 mb-sm-0 wide"
            v-if="user.payments.length >= 12 && !loaded"
            @click="more"
          >
            <v-icon left>$refresh</v-icon><span>Load All</span>
          </v-btn>
          <v-btn @click="exportCSV" class="flex-grow-1 wide">
          <v-icon left>$download</v-icon><span>Export CSV</span>
          </v-btn>
        </div>
      </div>
      <v-alert color="primary" class="black--text">No payments found</v-alert>
    </template>
  </div>
</template>

<script>
import { format, parse, isBefore } from 'date-fns';
import { mapGetters } from 'vuex';
import { call, sync } from 'vuex-pathify';
import bolt11 from 'bolt11';
import colors from 'vuetify/lib/util/colors';
import Copy from '../mixins/Copy';
import NetworkIcon from './NetworkIcon';

let bs = 'https://blockstream.info';
const SATS = 100000000;

export default {
  components: { NetworkIcon },
  mixins: [Copy],

  filters: {
    abs: v => Math.abs(v),
    format: d => format(d, 'MMM D HH:mm:ss'),
    short: d => format(d, 'MMM D, YYYY'),
    trim: s => (s.length > 20 ? s.substr(0, 20) + '...' : s),
    twodec: n => n.toFixed(2),
  },

  data() {
    return {
      copytext: '',
      loaded: false,
      success: {},
    };
  },

  computed: {
    precision() {
      if (this.user.unit === 'SAT') return 0;
      else return undefined;
    },
    ...mapGetters(['initializing', 'user']),
    loading: sync('loading'),
  },

  methods: {
    updatePayment: call('updatePayment'),
    updateMemo(id) {
      let memo = this.$refs[`memo${id}`][0].$refs.input.value;
      this.updatePayment({ id, memo });
      this.success[id] = true;
    },
    ticker(a) {
      if (!a || a.ticker === 'BTC') return this.user.unit;
      return a.ticker;
    },
    snack: call('snack'),
    loadPayments: call('loadPayments'),

    async exportCSV() {
      if (!this.loaded) await this.more();
      const keys = [
        'hash',
        'updatedAt',
        'rate',
        'currency',
        'amount',
        'fee',
        'tip',
      ];
      const csv =
        keys.map(k => `"${k}"`).join(',') +
        '\n' +
        this.user.payments
          .map(r => keys.map(k => `"${r[k]}"`).join(','))
          .join('\n');

      const filename = 'payments.csv';
      let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
      } else {
        let link = document.createElement('a');
        if (link.download !== undefined) {
          let url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    },

    async more() {
      this.loading = true;
      await this.loadPayments();
      this.loaded = true;
      this.loading = false;
    },

    filteredPayments() {
      if (!this.user.payments.length) return [];
      return this.user.payments
        .map(p => {
          let o = JSON.parse(JSON.stringify(p));
          o.amount = p.amount + p.tip;
          o.displayAmount = this.$format(Math.abs(o.amount), this.precision);
          o.displayFee = this.$format(Math.abs(o.fee), this.precision);
          o.fiat = (Math.round(p.amount * p.rate) / SATS).toFixed(2);
          o.tip = parseFloat((p.tip * p.rate) / SATS).toFixed(2);
          if (isNaN(o.tip) || o.tip <= 0) o.tip = null;
          o.color = o.amount < 0 ? 'red--text' : 'green--text';
          o.sign = o.amount < 0 ? '-' : '+';
          if (o.network === 'BTC') o.link = `${bs}/tx/${o.hash}`;
          if (o.network === 'LBTC') o.link = `${bs}/liquid/tx/${o.hash}`;
          if (o.network === 'LNBTC') {
            try {
              o.hash = bolt11
                .decode(o.hash.toLowerCase())
                .tags.find(t => t.tagName === 'payment_hash').data;
            } catch (e) {
              console.log(e);
            }
          }
          return o;
        })
        .sort((a, b) =>
          isBefore(parse(a.createdAt), parse(b.createdAt)) ? -1 : 1
        )
        .filter(p => p.amount < 0 || p.received)
        .filter(p => p.account_id === this.user.account.id)
        .reverse();
    },

    explore(link) {
      window.open(link, '_blank');
    },
  },
};
</script>

<style lang="stylus" scoped>
.sent
  color rgb(255, 185, 85) !important

.received
 color rgb(180, 255, 0) !important

.fullwidth
  width 100%

.date-picker .v-btn
  width 100%

code
  width 100%
  word-wrap break-word
  font-size 0.9em
  padding 5px

.v-chip
  cursor pointer

.toggle
  max-height 24px
  margin-top -12px
  margin-bottom 6px
  min-width 44px !important
</style>
