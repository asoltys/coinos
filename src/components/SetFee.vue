<template>
  <v-dialog v-model="dialog" width="500" @click:outside="close">
    <v-card>
      <v-card-title class="headline" primary-title>
        Fee Policy
      </v-card-title>

      <v-card-text>
        <v-text-field
          @focus="select"
          label="Fee Rate"
          v-model="feeRate"
          type="number"
          suffix="sats/byte"
        />
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
import { call, sync } from 'vuex-pathify';
export default {
  props: { adjusting: { type: Boolean } },
  data() {
    return {
      dialog: false,
    };
  },
  computed: {
    feeRate: sync('feeRate'),
  },
  methods: {
    estimateFee: call('estimateFee'),
    close() {
      this.dialog = false;
      this.estimateFee();
    },
    select(e) { e.target.select(); },
  },
  watch: {
    adjusting() {
      this.dialog = true;
    },
  },
};
</script>
