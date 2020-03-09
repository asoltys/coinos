<template>
  <v-dialog v-model="dialog" width="500" @click:outside="close">
    <v-card>
      <v-card-title class="headline" primary-title>
        Fee Policy
      </v-card-title>

      <v-card-text>
        <div v-if="feePolicy === 'auto'">
          <v-text-field
            @focus="select"
            label="Confirmation Target"
            v-model="confTarget"
            type="number"
            suffix="blocks"
          />
          <v-select
            :items="['ECONOMICAL', 'CONSERVATIVE']"
            filled
            v-model="mode"
            label="Estimate Mode"
          />
            <v-btn color="secondary" @click="feePolicy = 'manual'">
              Custom Fee Rate
            </v-btn>
        </div> 
        <div v-else>
          <v-text-field
            @focus="select"
            label="Fee Rate"
            v-model="feeRate"
            type="number"
            suffix="sats/byte"
          />
          <v-btn color="secondary" @click="feePolicy = 'auto'">
            Confirmation Target
          </v-btn>
        </div>
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
    confTarget: sync('confTarget'),
    feeRate: sync('feeRate'),
    mode: sync('mode'),
    feePolicy: sync('feePolicy'),
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
