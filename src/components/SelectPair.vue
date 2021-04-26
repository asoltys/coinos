<div>
<v-autocomplete v-else label="Asset" v-model="a1" :items="all">
            <template v-slot:append>
              <div class="caption primary--text text-center mt-1">
                {{ a2.substr(0, 8) }}
              </div>
            </template>
            <template v-slot:item="{ item }">
              <div>
                <div class="d-flex">
                  <div class="flex-grow-1 title">{{ item.text }}</div>
                  <v-spacer />
                  <div class="mt-auto font-weight-bold">{{ item.balance }}</div>
                </div>
                <div class="caption primary--text">{{ item.value }}</div>
              </div>
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
<v-autocomplete v-else label="Asset" v-model="a2" :items="all">
            <template v-slot:append>
              <div class="caption primary--text text-center mt-1">
                {{ a2.substr(0, 8) }}
              </div>
            </template>
            <template v-slot:item="{ item }">
              <div>
                <div class="d-flex">
                  <div class="flex-grow-1 title">{{ item.text }}</div>
                  <v-spacer />
                  <div class="mt-auto font-weight-bold">{{ item.balance }}</div>
                </div>
                <div class="caption primary--text">{{ item.value }}</div>
              </div>
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
          </div>

<script>
import icons from '../icons.json';
import Amount from './Amount';
import { get, call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Proposal from './Proposal';

const SATS = 100000000;
const btc = process.env.VUE_APP_LBTC;
const lcad = process.env.VUE_APP_LCAD;

export default {
  props: {
    bid: { type: Object },
    ask: { type: Object },
  },
  components: { Amount, Proposal },
  mixins: [Copy],

  data: () => ({
    custom: false,
    focused: false,
    inversePrice: null,
    price: null,
    icons,
    swapping: false,
    loading: false,
    v1: null,
    v2: null,
  }),

  computed: {
    inverse: sync('inverse'),
    type: sync('type'),
    a1Acc() {
      return this.user.accounts.find(a => a.asset === this.a1);
    },
    a1: sync('a1'),
    a2: sync('a2'),
    error: sync('error'),
    assets: get('assets'),
    all() {
      return Object.keys(this.assets)
        .map(asset => {
          const account = this.user.accounts.find(a => a.asset === asset);
          let balance = null;
          if (account) ({ balance } = account);
          return {
            text: `${this.assets[asset].ticker} - ${this.assets[asset].name}`,
            value: asset,
            balance,
          };
        })
        .filter(
          a =>
            this.assets[a.value].ticker &&
            this.assets[a.value].name &&
            a.value !== this.a1
        )
        .sort((a, b) => ('' + a.text).localeCompare(b.text));
    },
    accounts() {
      let accounts = this.user.accounts
        .filter(a => a.asset !== this.a2 && !a.hide)
        .map(a => ({
          text: `${a.ticker} - ${a.name}`,
          value: a.asset,
          balance: a.balance,
        }));

      if (this.a1) {
        let { name: text, asset: value } = this.assets[this.a1];
        if (!accounts.find(a => a.value === this.a1))
          accounts.push({ text, value, balance: 0 });
      }

      return accounts.sort((a, b) => ('' + a.text).localeCompare(b.text));
    },

    orders: get('orders'),
    order: sync('order'),
    user: get('user'),
  },

  methods: {
    swap() {
      this.swapping = true;
    },
    inversePriceUpdate(v) {
      if (!v) return;

      if (this.type === 'sell') {
        this.v2 = Math.round(this.v1 / v);
      } else {
        this.v1 = Math.round(this.v2 * v);
      }
      this.price = (1 / v).toFixed(8);
    },
    priceUpdate(v) {
      if (!v) return;
      if (this.type === 'sell') {
        this.v2 = Math.round(this.v1 * v);
      } else {
        this.v1 = Math.round(this.v2 / v);
      }
      this.inversePrice = (1 / v).toFixed(8);
    },
    v1Update(v1) {
      if (v1 && this.v2) {
        if (this.type === 'sell') {
          this.v2 = Math.round(this.price * v1);
        } else {
          this.price = (this.v2 / v1).toFixed(8);
          this.inversePrice = (v1 / this.v2).toFixed(8);
        }
      }
    },
    v2Update(v2) {
      if (v2 && this.v1) {
        if (this.type === 'sell') {
          this.price = (v2 / this.v1).toFixed(8);
          this.inversePrice = (this.v1 / v2).toFixed(8);
        } else {
          this.v1 = (v2 / this.price).toFixed(8);
        }
      }
    },
    precision(asset) {
      return this.assets[asset] ? this.assets[asset].precision : 0;
    },
    ticker(asset) {
      if (asset === process.env.VUE_APP_LBTC) return 'BTC';
      return this.assets[asset]
        ? this.assets[asset].ticker || asset.substr(0, 3).toUpperCase()
        : '';
    },

    createOrder: call('createOrder'),

    flip() {
      let { t1, t2 } = this.$router.currentRoute.params;
      if (this.a2.startsWith(t1)) this.switcheroo();
      else this.$go(`/markets/${t2}-${t1}`);
    },

    switcheroo() {
      let temp = this.a1;
      this.a1 = this.a2;
      this.a2 = temp;
      temp = this.v1;
      this.v1 = this.v2;
      this.v2 = temp;
    },

    async submit() {
      const { a1, a2, v1, v2 } = this;
      this.loading = true;
      if (!v1 || !v2) this.error = 'Amounts must be greater than zero';
      await this.createOrder({ a1, a2, v1, v2 });
      this.prefill();
      this.loading = false;
    },

    withdraw: call('withdraw'),
    prefill() {
      let { bid, ask, type, v1, v2 } = this;
      if (bid && type === 'sell' && !v1) {
        this.v1 = Math.round(bid.v1 * bid.rate);
        this.v2 = Math.round(bid.v2 / bid.rate);
        this.price = (this.v2 / this.v1).toFixed(8);
        this.inversePrice = (this.v1 / this.v2).toFixed(8);
      }
      if (ask && type === 'buy' && !v2) {
        this.v1 = bid.v1;
        this.v2 = bid.v2;
        this.price = (this.v1 / this.v2).toFixed(8);
        this.inversePrice = (this.v2 / this.v1).toFixed(8);
      }
    },
  },

  watch: {
    a1(a1) {
      this.v1 = this.v2 = this.price = this.inversePrice = 0;
      this.prefill();
    },
    a2(a2) {
      this.v1 = this.v2 = this.price = this.inversePrice = 0;
      this.prefill();
    },
    bid(bid) {
      this.prefill();
    },
    ask(ask) {
      this.prefill();
    },
    type(v) {
      this.inverse = !this.inverse;
      this.switcheroo();
      this.focused = false;

      this.$nextTick(() => {
        if (v === 'buy') {
          this.v1 = this.bid.v2;
          this.v2 = this.bid.v1;
          this.price = (1 / this.bid.rate).toFixed(8);
          this.inversePrice = this.bid.rate.toFixed(8);
        } else {
          this.v1 = this.ask.v1;
          this.v2 = this.v1 / this.bid.rate;
          this.price = (1 / this.bid.rate).toFixed(8);
          this.inversePrice = this.bid.rate.toFixed(8);
        }
      });
    },
  },

  mounted() {
    this.prefill();
  },
};
</script>
