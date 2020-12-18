<template>
  <v-dialog v-model="dialog" width="500" @click:outside="close">
    <v-card>
      <v-card-title class="headline" primary-title>
        Fee Rate
      </v-card-title>



      <v-card-text>
        <v-slider
          :step="1"
          v-model="logFeeRate"
          :min="min"
          :max="max"
          class="align-center"
          hide-details
          @input="setFeeRate"
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
      logFeeRate: Math.log(1000),
    };
  },
  computed: {
    min() {
      return 0;
    },
    max() {
      return 20;
    },
    payment: sync('payment'),
  },
  methods: {
    setFeeRate(v) {
      let minv = Math.log(this.payment.network === 'bitcoin' ? 1000 : 100);
      let maxv = Math.log(this.payment.network === 'bitcoin' ? 1000000 : 100000);
      let scale = (maxv-minv) / (this.max-this.min);

      this.payment.feeRate = Math.round(Math.exp(minv + scale*(v-this.min)));
    },
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
