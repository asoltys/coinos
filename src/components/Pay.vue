<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <div v-else-if="lnurl">
      <v-card class="elevation-1 my-2 pa-4">
        <div class="text-center headline">{{ lnurl.defaultDescription }}</div>
        <div class="d-flex justify-center">
          <div class="mr-2 text-center">
            <div class="headline">Payment to {{ domain }}</div>
            <div>
              <span class="primary--text">Min: </span>
              <span class="headline">{{ min }}</span> SAT
            </div>
            <div>
              <span class="primary--text">Max: </span>
              <span class="headline">{{ max }}</span>
              SAT
            </div>
            <div v-for="m in JSON.parse(lnurl.metadata)" :key="m[1]">
              <span v-if="m[0] === 'text/plain'">
                {{ m[1] }}
              </span>
              <img
                v-if="m[0].includes('image')"
                :src="`data:image/png;base64,${m[1]}`"
              />
            </div>
          </div>
        </div>
      </v-card>
      <amount v-model.number="amount" :max="max" class="mb-2" />
      <v-text-field label="Comment" v-model="comment" />
      <div class="d-flex">
        <v-btn
          class="flex-grow-1 wide"
          dark
          @click="submit"
          :disabled="amount < min || amount > max"
        >
          <v-icon left color="green">$send</v-icon><span>Pay</span>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import Amount from './Amount';
import { get, call, sync } from 'vuex-pathify';

const SATS = 100000000;

export default {
  components: { Amount },
  data: () => ({
    amount: null,
    comment: null,
    result: null,
  }),
  methods: {
    submit() {
      this.pay({ amount: this.amount, comment: this.comment });
    },
    pay: call('pay'),
  },
  computed: {
    domain() {
      return this.lnurl.callback
        .split('://')[1]
        .split('/')[0]
        .split('@')
        .slice(-1)[0]
        .split(':')[0];
    },
    min() {
      return Math.round(this.lnurl.minSendable / 1000);
    },
    max() {
      return Math.round(this.lnurl.maxSendable / 1000);
    },
    loading: get('loading'),
    lnurl: get('lnurl'),
  },
  mounted() {
    if (!this.lnurl) return this.$go('/home');
    this.amount = this.max;
  },
};
</script>
