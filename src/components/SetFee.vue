<template>
  <v-dialog v-model="dialog" width="500" @click:outside="close">
    <v-card>
      <v-card-title class="headline" primary-title>
        Fee Rate
      </v-card-title>



      <v-card-text>
        <v-slider
          v-model="payment.feeRate"
          :min="min"
          :max="max"
          class="align-center"
          hide-details
        >
          <template v-slot:append>
            <v-text-field
              v-model="payment.feeRate"
              class="mt-0 pt-0"
              type="text"
              suffix="sat/kb"
              @keyup.enter="close"
              readonly
              hide-details
            />
          </template>
        </v-slider>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="close">
          ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
export default {
  props: { adjusting: { type: Boolean } },
  data() {
    return {
      dialog: false,
    };
  },
  computed: {
    min() {
      return this.payment.network === 'BTC' ? 1000 : 100;
    },
    max() {
      return this.payment.network === 'BTC' ? 50000 : 5000;
    },
    payment: sync('payment'),
  },
  methods: {
    estimateFee: call('estimateFee'),
    close() {
      this.dialog = false;
      this.$emit('closed');
    },
  },
  watch: {
    adjusting() {
      this.dialog = true;
    },
  },
};
</script>
