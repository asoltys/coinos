<template>
  <v-card class="mb-2">
    <v-alert class="headline black--text text-center" color="yellow"
      >Sent!</v-alert
    >
    <div class="pa-4">
      <div class="mb-2 text-center">
        <div>
          <span class="display-1">{{ total }}</span>
          SAT
          <span class="ml-2 yellow--text">
            <span class="display-1">{{ fiat(total) }}</span>
            {{ payment.currency }}
          </span>
        </div>
      </div>

      <div class="mb-4 text-center">
        <div>
          <span class="headline orange--text">Fees: </span>
          <span class="display-1">{{ payment.fee || 0 }}</span> SAT
          <span class="ml-2 yellow--text">
            <span class="display-1">{{ fiat(payment.fee) }}</span>
            {{ payment.currency }}
          </span>
        </div>
      </div>

      <pre v-if="details">{{ payment.txid }}</pre>

      <v-btn @click="back" class="mr-2">
        <v-icon class="mr-2">arrow_back</v-icon><span>Send Another</span>
      </v-btn>
      <v-btn v-if="payment.txid" @click="link(payment.txid)">
        <v-icon class="mr-2">open_in_new</v-icon><span>Blockchain</span>
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

  data() {
    return {
      details: false,
    };
  },

  computed: {
    ...mapGetters(['rate', 'user']),
    total() {
      return Math.abs(this.payment.amount) - this.payment.fee;
    },
  },

  methods: {
    ...mapActions(['snack']),

    toggleDetails() {
      this.details = !this.details;
    },

    fiat(n) {
      if (!n || isNaN(n)) return '0.00';
      return ((n * this.payment.rate) / 100000000).toFixed(2);
    },

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
