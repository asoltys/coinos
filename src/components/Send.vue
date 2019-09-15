<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <v-layout v-else>
      <v-flex class="text-center mb-2">
        <span class="display-2">{{ user.balance }} </span>
        <span class="headline">SAT</span>
        <h3>
          {{ ((user.balance / 100000000) * rate).toFixed(2) }} CAD @
          <span class="yellow--text">{{ rate }}</span> per BTC
        </h3>
      </v-flex>
    </v-layout>
    <v-card v-if="payment">
      <v-alert class="headline" color="success">Payment Sent!</v-alert>
      <v-list>
        <v-list-item v-if="payment.txid">
          <v-list-item-content>
            <v-list-item-title>Transaction ID</v-list-item-title>
            <v-list-item-subtitle>{{ payment.txid }} </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-flex class="text-right">
              <v-btn class="mr-1" small icon ripple @click="copy(payment.txid)">
                <v-icon small>content_copy</v-icon>
              </v-btn>
              <v-btn small icon ripple @click="link(payment.txid)">
                <v-icon small>open_in_new</v-icon>
              </v-btn>
            </v-flex>
          </v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Amount</v-list-item-title>
          <v-list-item-subtitle>{{ total }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Fees</v-list-item-title>
          <v-list-item-subtitle>{{ fees || 0 }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <v-card-actions>
        <v-btn @click="back">
          <v-icon class="mr-2">arrow_back</v-icon><span>Send Another</span>
        </v-btn>
      </v-card-actions>
    </v-card>
    <template v-else>
      <div v-if="!payobj && !payuser && !address">
        <v-textarea
          class="my-4"
          label="Address or Invoice:"
          dark
          v-model="to"
          clearable
          auto-grow
          rows="1"
          hide-details
          autofocus
        />
        <div class="mx-auto">
          <v-btn
            class="mr-2"
            v-if="user.fbtoken"
            @click="$router.push('/contacts')"
          >
            <v-icon class="mr-1">person</v-icon>
            <span>Address Book</span>
          </v-btn>
        </div>
      </div>
      <v-card class="elevation-1 pa-2 my-4 text-center" v-if="address">
        <v-layout wrap>
          <v-flex>
            <div class="body-1 gray--text">Recipient Address</div>
            <v-divider />
          </v-flex>
          <v-flex xs12>
            <code class="black--text mt-2">{{ address }}</code>
          </v-flex>
          <v-flex v-if="scannedBalance">
            <span class="display-1">&nbsp;{{ scannedBalance }} </span>
            <span>SAT</span>
          </v-flex>
        </v-layout>
      </v-card>
      <v-card class="elevation-1 pa-2 my-4 text-center" v-if="payuser">
        <v-layout wrap>
          <v-flex>
            <div class="body-1 gray--text">Send To</div>
          </v-flex>
          <v-flex v-if="friend" xs12>
            <v-avatar><img :src="friend.pic"/></v-avatar
            ><span class="subheading ml-2">{{ friend.name }}</span>
          </v-flex>
        </v-layout>
      </v-card>
      <template v-if="address || payuser">
        <numpad
          class="mt-4"
          :currency="currency"
          :amount="parseFloat(display)"
          @update="updateAmount"
          @toggle="toggle"
        ></numpad>
      </template>
      <v-list class="elevation-1 ma-2" v-if="payobj">
        <v-list-item>
          <v-list-item-title>Amount</v-list-item-title>
          <v-list-item-subtitle>{{ payobj.satoshis }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Recipient</v-list-item-title>
          <v-list-item-subtitle>{{ payobj.payeeNodeKey }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Date</v-list-item-title>
          <v-list-item-subtitle>
            {{ payobj.timestampString | format }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <div>
        <v-btn @click="back" class="mr-2">
          <v-icon>arrow_back</v-icon><span>Go Back</span>
        </v-btn>
        <v-btn v-if="!loading && to" color="green" dark @click="sendPayment">
          <v-icon class="mr-1">send</v-icon><span>Pay</span>
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import date from 'date-fns';
import Numpad from './NumPad';

export default {
  components: { Numpad },

  filters: {
    trim: w => w.substring(0, 12),
    format: d => date.format(d, 'MMM D, YYYY HH:mm'),
  },

  props: {
    keep: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      fiat: false,
      display: 0,
    };
  },

  computed: {
    friend() {
      return this.friends.find(f => f.id === this.payuser);
    },

    conversion() {
      if (this.fiat) return this.rate;
      return parseFloat(1 / this.rate).toFixed(6);
    },

    ...mapGetters([
      'address',
      'amount',
      'fees',
      'friends',
      'balance',
      'loading',
      'user',
      'payment',
      'payreq',
      'payobj',
      'payuser',
      'rate',
      'scannedBalance',
    ]),

    currency() {
      if (this.fiat) return this.user.currency;
      return 'sat';
    },

    total() {
      let p = this.payment;
      if (p) {
        if (p.payment_route) {
          let amt = p.payment_route.total_amt.low;
          if (p.payment_route.total_fees) amt -= p.payment_route.total_fees.low;
          return amt;
        }

        return p.amount.low;
      }
      return 0;
    },

    fees() {
      let p = this.payment;
      if (p) {
        if (p.payment_route) return p.payment_route.total_fees;
        return p.fees;
      }
      return 0;
    },

    to: {
      get() {
        if (this.payreq) return this.payreq;
        if (this.address) return this.address;
        if (this.payuser) return this.payuser;
        return null;
      },
      set(v) {
        if (!v) v = '';
        this.$store.dispatch('handleScan', v.trim());
      },
    },
  },

  watch: {
    amount(v) {
      if (this.fiat) this.display = ((v / 100000000) * this.rate).toFixed(2);
      else this.display = v;
    },
  },

  methods: {
    ...mapActions(['sendPayment', 'clearPayment', 'snack']),

    init() {
      if (!this.keep) this.clearPayment();
      if (this.$route.query.refresh !== undefined) {
        this.$router.replace(this.$route.path);
      }

      this.updateAmount(this.amount);
    },

    updateAmount(v) {
      if (this.fiat) {
        this.$store.commit('amount', ((v * 100000000) / this.rate).toFixed(0));
        this.display = ((v / 100000000) * this.rate).toFixed(2);
      } else {
        this.$store.commit('amount', v);
        this.display = v;
      }
    },

    back() {
      this.display = 0;
      if (this.payreq || this.address) return this.clearPayment();
      if (this.payuser) return this.$router.push('/contacts');
      return this.$router.push('/home');
    },

    maxamount() {
      this.amount = this.user.balance;
    },

    toggle() {
      this.fiat = !this.fiat;
      if (this.fiat) this.display = (this.display / 100000000) * this.rate;
      else this.display = (this.display * 100000000) / this.rate;
    },

    link(tx) {
      let bs = 'https://blockstream.info';
      if (
        process.env.NODE_ENV !== 'production' ||
        window.location.href.contains('test')
      )
        bs += '/testnet';
      window.location = `${bs}/tx/${tx}`;
    },

    copy(tx) {
      var textArea = document.createElement('textarea');
      textArea.style.position = 'fixed';
      textArea.value = tx;

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      document.execCommand('copy');
      document.body.removeChild(textArea);

      this.snack('Copied to Clipboard');
    },
  },

  beforeRouteUpdate(to, from, next) {
    next();
    this.init();
  },

  mounted() {
    this.init();
    this.$store.commit('payuser', this.$route.query.payuser);
  },
};
</script>

<style lang="stylus" scoped>
.icon
  width 40px !important

.v-chip
  width 95%
  padding 5px

code
  max-width 100%
  word-wrap break-word
  font-size 1.2em
</style>
