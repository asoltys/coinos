<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <template v-else>
      <v-expansion-panels v-if="filteredPayments.length" accordion>
        <v-expansion-panel
          v-for="{
            link,
            hash,
            payobj,
            sign,
            color,
            fiat,
            amount,
            createdAt,
            tip,
          } in filteredPayments"
          :key="hash"
        >
          <v-expansion-panel-header
            ripple
            class="justify-center justify-space-around"
          >
            <div>
              <span class="display-1">
                <span :class="color">{{ sign }}</span>
                {{ amount | abs }}
              </span>
              <span> SAT</span>&nbsp;
              <div>
                <span class="yellow--text">
                  {{ sign }}{{ fiat | abs | twodec }}
                  {{ user.currency }}
                </span>
              </div>
            </div>
            <div class="text-right headline">{{ createdAt | format }}</div>

            <small v-if="tip">(+{{ tip }})</small>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div>
              {{ hash }}
              <v-btn class="mt-2" v-if="link" @click="explore(link)">
                <v-icon class="mr-1">open_in_new</v-icon><span>Blockchain</span>
              </v-btn>
              <pre>{{ payobj }}</pre>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-alert
        class="black--text"
        :value="!filteredPayments.length"
        v-else
        color="yellow"
        >No payments found in the given time period</v-alert
      >
    </template>
  </div>
</template>

<script>
import {
  format,
  parse,
  isBefore,
  isSameDay,
  isWithinRange,
  subWeeks,
  subMonths,
  subYears,
} from 'date-fns';
import { mapGetters } from 'vuex';
import bolt11 from 'bolt11';

let bs = 'https://blockstream.info';
if (
  process.env.NODE_ENV !== 'production' ||
  window.location.href.includes('test')
)
  bs += '/testnet';

export default {
  filters: {
    abs: v => Math.abs(v),
    format: d => format(d, 'MMM D HH:mm:ss'),
    short: d => format(d, 'MMM D, YYYY'),
    trim: s => (s.length > 20 ? s.substr(0, 20) + '...' : s),
    twodec: n => n.toFixed(2),
  },

  data() {
    return {
      presets: {
        'Last Year': {
          from: subYears(Date.now(), 1),
          to: Date.now(),
        },
        'Last Month': {
          from: subMonths(Date.now(), 1),
          to: Date.now(),
        },
        'Last Week': {
          from: subWeeks(Date.now(), 1),
          to: Date.now(),
        },
        Custom: {
          from: null,
          to: null,
        },
      },
      choosefrom: false,
      chooseto: false,
      currency: 'CAD',
      from: subYears(Date.now(), 1),
      to: parse(Date.now()),
    };
  },

  computed: {
    ...mapGetters(['loading', 'payments', 'user']),

    preset: {
      get() {
        let preset = 'Custom';
        let { from, to } = this;
        Object.keys(this.presets).map(k => {
          let p = this.presets[k];
          if (isSameDay(p.from, from) && isSameDay(p.to, to)) {
            preset = k;
          }
        });

        return preset;
      },
      set(v) {
        if (v === 'Custom') return;
        this.from = this.presets[v].from;
        this.to = this.presets[v].to;
      },
    },

    fromstring: {
      get() {
        return format(this.from, 'YYYY-MM-DD');
      },
      set(v) {
        this.from = parse(v);
      },
    },

    tostring: {
      get() {
        return format(this.to, 'YYYY-MM-DD');
      },
      set(v) {
        this.to = parse(v);
      },
    },

    filteredPayments() {
      if (!this.payments.length) return [];
      this.$nextTick(() => this.$emit('mask'));
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
          if (!(o.hash.startsWith('ln') || o.hash.startsWith('txn')))
            o.link = `${bs}/tx/${o.hash}`;
          if (o.hash.startsWith('ln')) {
            o.hash = bolt11
              .decode(o.hash.toLowerCase())
              .tags.find(t => t.tagName === 'payment_hash').data;
          }

          return o;
        })
        .sort((a, b) => {
          if (isBefore(parse(a.createdAt), parse(b.createdAt))) {
            return -1;
          }
          return 1;
        })
        .map(p => {
          balance += parseFloat(p.amount);
          p.balance = balance;
          return p;
        })
        .filter(p => {
          return (
            isWithinRange(parse(p.createdAt), this.from, this.to) &&
            (p.amount < 0 || p.received)
          );
        })
        .reverse();
    },

    fiattotal() {
      return this.filteredPayments
        .reduce((a, b) => a + parseFloat(b.fiat), 0)
        .toFixed(2);
    },

    total() {
      return this.filteredPayments.reduce(
        (a, b) => a + parseFloat(b.amount),
        0
      );
    },

    tips() {
      return this.filteredPayments
        .reduce((a, b) => {
          if (!parseFloat(b.tip)) return a;
          return a + parseFloat(b.tip);
        }, 0)
        .toFixed(2);
    },
  },

  methods: {
    explore(link) {
      window.location.href = link;
    },
  },

  mounted() {
    this.$store.dispatch('getPayments');
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
</style>
