<template>
  <v-dialog v-model="dialog" width="500" @click:outside="close">
    <v-card>
      <v-card-title class="headline" primary-title>
        Fee Rate
      </v-card-title>

      <v-card-text>
        <v-slider
          v-model="feeRate"
          :min="min"
          :max="max"
          class="align-center"
          hide-details
        >
          <template v-slot:append>
            <v-text-field
              v-model="feeRate"
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
    addressType: get('addressType'),
    feeRate: sync('feeRate'),
    min() {
      return this.addressType === 'bitcoin' ? 1000 : 100;
    },
    max() {
      return this.addressType === 'bitcoin' ? 10000 : 1000;
    },
  },
  methods: {
    estimateFee: call('estimateFee'),
    close() {
      this.dialog = false;
      this.estimateFee();
    },
  },
  watch: {
    adjusting() {
      this.dialog = true;
    },
  },
};
</script>
