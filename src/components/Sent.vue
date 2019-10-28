<template>
  <v-card class="mb-2">
    <v-alert class="headline" color="success">Payment Sent!</v-alert>
    <div class="pa-4">
      <div class="d-flex mb-2" v-if="payment.txid">
        <div>
          <b>Transaction ID</b>
          <div style="word-break: break-word">{{ payment.txid }}</div>
        </div>
        <div class="ml-auto d-flex">
          <v-btn class="mr-1" small icon ripple @click="copy(payment.txid)">
            <v-icon small>content_copy</v-icon>
          </v-btn>
          <v-btn small icon ripple @click="link(payment.txid)">
            <v-icon small>open_in_new</v-icon>
          </v-btn>
        </div>
      </div>

      <div class="mb-2">
        <b>Amount</b>
        <div class="d-flex justify-space-between">
          <div>
            <span class="display-1">{{ total }}</span> SAT
          </div>
          <div>
            <span class="yellow--text"
              ><span class="display-1">{{ fiat(total) }}</span>
              {{ user.currency }}</span
            >
          </div>
        </div>
      </div>

      <div class="mb-2">
        <b>Fees</b>
        <div class="d-flex justify-space-between">
          <div>
            <span class="display-1">{{ fees || 0 }}</span> SAT
          </div>
          <div>
            <span class="yellow--text"
              ><span class="display-1">{{ fiat(fees) }}</span>
              {{ user.currency }}</span
            >
          </div>
        </div>
      </div>

      <v-btn @click="back">
        <v-icon class="mr-2">arrow_back</v-icon><span>Send Another</span>
      </v-btn>
    </div>
  </v-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
export default {
  props: {
    back: { type: Function },
    payment: { type: Object },
  },

  computed: {
    ...mapGetters(['rate', 'user']),

    total() {
      let p = this.payment;

      if (p) {
        if (p.payment_route) {
          let amt = p.payment_route.total_amt;
          if (p.payment_route.total_fees) amt -= p.payment_route.total_fees;
          return amt;
        }

        return p.amount;
      }
      return 0;
    },

    fees() {
      let p = this.payment;
      if (p) {
        if (p.payment_route) return p.payment_route.total_fees || 0;
        return p.fees;
      }
      return 0;
    },
  },

  methods: {
    fiat(n) {
      return ((n * this.rate) / 100000000).toFixed(2);
    },

    ...mapActions(['snack']),
    link(tx) {
      let bs = 'https://blockstream.info';
      if (
        process.env.NODE_ENV !== 'production' ||
        window.location.href.includes('test')
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
};
</script>
