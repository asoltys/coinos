<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <template v-else>
      <template>
        <v-layout class="date-picker">
          <v-flex xs4>
            <v-date-picker
              v-if="choosefrom"
              v-model="fromstring"
              color="secondary"
              @input="choosefrom = false"
            ></v-date-picker>
            <v-btn
              v-else
              @click="
                choosefrom = !choosefrom;
                chooseto = false;
              "
              :color="choosefrom ? 'green' : ''"
              small
            >
              <v-icon class="mr-1">event</v-icon><span>{{ from | short }}</span>
            </v-btn>
          </v-flex>
          <v-flex class="ml-3 my-auto text-center" xs2>
            <div class="subheading">to</div>
          </v-flex>
          <v-flex xs4>
            <v-date-picker
              v-if="chooseto"
              v-model="tostring"
              color="secondary"
              @input="chooseto = false"
            ></v-date-picker>
            <v-btn
              v-else
              @click="
                chooseto = !chooseto;
                choosefrom = false;
              "
              :color="chooseto ? 'green' : ''"
              small
            >
              <v-icon class="mr-1">event</v-icon><span>{{ to | short }}</span>
            </v-btn>
          </v-flex>
        </v-layout>
        <v-layout>
          <v-flex xs12>
            <v-select :items="Object.keys(presets)" v-model="preset"></v-select>
          </v-flex>
        </v-layout>
      </template>
      <template v-if="filteredPayments.length">
        <v-layout>
          <v-flex xs4>
            <v-text-field
              label="Total sat"
              v-model="total"
              readonly
            ></v-text-field>
          </v-flex>
          <v-flex xs4>
            <v-text-field
              label="Total CAD"
              v-model="fiattotal"
              readonly
            ></v-text-field>
          </v-flex>
          <v-flex xs4>
            <v-text-field
              label="Total Tips"
              v-model="tips"
              readonly
            ></v-text-field>
          </v-flex>
        </v-layout>
        <v-list three-line subheader>
          <template v-for="payment in filteredPayments">
            <v-list-item
              background="blue"
              :key="payment.date"
              @click="link(payment)"
            >
              <v-list-item-content>
                <v-list-item-title>{{ payment.hash | trim }}</v-list-item-title>
                <v-list-item-subtitle :class="color(payment)">
                  <span
                    >{{ payment.amount | abs }} sat</span
                  ></v-list-item-subtitle
                >
                <v-list-item-subtitle :class="color(payment)">
                  <span>{{ payment.fiat | abs | twodec }} CAD</span
                  ><small v-if="payment.tip">
                    (+{{ payment.tip }})</small
                  ></v-list-item-subtitle
                >
              </v-list-item-content>
              <v-list-item-action>
                <v-list-item-action-text>{{
                  payment.createdAt | format
                }}</v-list-item-action-text>
                <v-list-item-subtitle
                  >balance: {{ payment.balance }}</v-list-item-subtitle
                >
                <v-layout></v-layout>
              </v-list-item-action>
            </v-list-item>
          </template>
        </v-list>
      </template>
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

export default {
  filters: {
    abs: v => Math.abs(v),
    format: d => format(d, 'YYYY-MM-DD HH:mm'),
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
    ...mapGetters(['loading', 'payments']),

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
    color(p) {
      return p.amount < 0 ? 'sent' : 'received';
    },
    link(p) {
      if (p.hash.startsWith('ln') || p.hash.startsWith('txn')) return;
      let bs = 'https://blockstream.info';
      if (
        process.env.NODE_ENV !== 'production' ||
        window.location.href.includes('test')
      )
        bs += '/testnet';
      window.location = `${bs}/tx/${p.hash}`;
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
