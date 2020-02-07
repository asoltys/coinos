<template>
  <div>
    <v-progress-linear
      v-if="initializing || loading"
      indeterminate
    ></v-progress-linear>
    <template v-else>
      <div v-if="filteredPayments().length">
        <v-expansion-panels accordion>
          <v-expansion-panel
            v-for="{
              asset,
              currency,
              confirmed,
              link,
              hash,
              id,
              payobj,
              sign,
              color,
              fiat,
              amount,
              createdAt,
              updatedAt,
            } in filteredPayments()"
            :key="id"
          >
            <v-expansion-panel-header
              ripple
              class="justify-center justify-space-around flex-wrap"
            >
              <div style="white-space: nowrap;">
                <span class="headline">
                  <span :class="color">{{ sign }}</span>
                  {{ amount | abs }}
                </span>
                SAT
                <div>
                  <span class="yellow--text">
                    {{ fiat | abs | twodec }}
                    {{ currency }}
                  </span>
                </div>
              </div>
              <div class="text-right subtitle-1" style="white-space: nowrap;">
                <v-chip v-if="!confirmed" color="red" class="mr-2">
                  <v-icon class="mr-1">warning</v-icon>
                  <span class="d-none d-sm-inline">unconfirmed</span>
                </v-chip>
                {{ updatedAt | format }}
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content class="text-left">
              <v-card class="pa-4" style="background: #333">
                <div class="text-center">
                  <flash v-if="asset === 'LNBTC'" fillColor="yellow" />
                  <water v-else-if="asset === 'LBTC'" fillColor="#00aaee" />
                  <v-icon v-else-if="asset === 'GIFT'">card_giftcard</v-icon>
                  <img v-else src="../assets/bitcoin.png" width="24px" />
                </div>
                <code class="black--text my-4 py-2 text-center">{{
                  hash
                }}</code>
                <div class="d-flex justify-center">
                  <v-btn class="mt-2 mr-2" @click.native="() => copy(hash)">
                    <v-icon class="mr-1">content_copy</v-icon><span>Copy</span>
                  </v-btn>
                  <v-btn class="mt-2" v-if="link" @click="explore(link)">
                    <v-icon class="mr-1">open_in_new</v-icon
                    ><span>Explore</span>
                  </v-btn>
                </div>
                <div v-if="1 === 2">
                  <strong>Notes</strong>
                  <p>
                    This was a very lovely transaction I most enjoyed it thank
                    you very much!
                  </p>
                </div>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <div class="d-flex">
          <v-btn
            class="my-4 mx-auto"
            v-if="payments.length === 12 && !loaded"
            @click="more"
          >
            <v-icon class="mr-1">get_app</v-icon><span>Load More</span>
          </v-btn>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { format, parse, isBefore } from 'date-fns';
import { mapGetters } from 'vuex';
import { call } from 'vuex-pathify';
import bolt11 from 'bolt11';
import Water from 'vue-material-design-icons/Water';
import Flash from 'vue-material-design-icons/Flash';
import colors from 'vuetify/lib/util/colors';

let bs = 'https://blockstream.info';
if (
  process.env.NODE_ENV !== 'production' ||
  window.location.href.includes('test')
)
  bs += '/testnet';

export default {
  components: { Flash, Water },

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
    };
  },

  computed: {
    ...mapGetters(['initializing', 'loading', 'payments', 'user']),
  },

  methods: {
    copy(text) {
      var textArea = document.createElement('textarea');
      textArea.style.position = 'fixed';
      textArea.value = text;

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      document.execCommand('copy');
      document.body.removeChild(textArea);

      this.snack('Copied to Clipboard');
    },

    snack: call('snack'),
    loadPayments: call('loadPayments'),

    more() {
      this.loadPayments();
      this.loaded = true;
    },

    filteredPayments() {
      if (!this.payments.length) return [];
      let balance = 0;
      return this.payments
        .map(p => {
          let o = JSON.parse(JSON.stringify(p));
          o.fiat = ((p.amount * p.rate) / 100000000).toFixed(2);
          o.tip = parseFloat(p.tip).toFixed(2);
          if (isNaN(o.tip) || o.tip <= 0) o.tip = null;
          if (o.tip) o.fiat -= o.tip;
          o.color = o.amount < 0 ? 'red--text' : 'green--text';
          o.sign = o.amount < 0 ? '-' : '+';
          if (o.asset === 'BTC') o.link = `${bs}/tx/${o.hash}`;
          if (o.asset === 'LBTC') o.link = `${bs}/liquid/tx/${o.hash}`;
          if (o.asset === 'LNBTC') {
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
        .map(p => {
          balance += parseFloat(p.amount);
          p.balance = balance;
          return p;
        })
        .filter(p => p.amount < 0 || p.received)
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

.v-chip
  cursor pointer
</style>
