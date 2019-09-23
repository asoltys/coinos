<template>
  <v-card class="mb-2">
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
</template>

<script>
export default {
  props: {
    back: { type: Function },
    payment: { type: Object },
  },

  computed: {
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
        if (p.payment_route) return p.payment_route.total_fees;
        return p.fees;
      }
      return 0;
    },
  },

  methods: {
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
};
</script>
