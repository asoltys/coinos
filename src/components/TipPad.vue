<template>
  <div class="tippad">
    <div v-if="custom">
      <numpad :initialAmount="tip" @input="updateTip" @done="done" />
      <div class="d-flex my-2">
        <v-btn
          class="black--text flex-grow-1"
          color="primary"
          dark
          @click="done"
        >
          <v-icon class="mr-1">check</v-icon><span>Done</span>
        </v-btn>
      </div>
    </div>
    <div v-else>
      <div class="d-flex display-1 text-center justify-center">
        <div class="flex-grow-1">{{ tip }} <span class="body-1">SAT</span></div>
        <div class="flex-grow-1">{{ percent }}%</div>
        <div class="flex-grow-1 yellow--text">
          {{ fiatTip }} <span class="body-1">{{ user.currency }}</span>
        </div>
      </div>
      <v-slider v-model="percent" min="0" :max="max" />
      <v-btn
        v-for="i in percents"
        class="mb-2"
        @click="select(i)"
        :key="i"
      >
        <span>{{ i }}%</span>
      </v-btn>
      <v-btn class="mb-2" @click="custom = true">
        <span>Custom</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import Numpad from './NumPad';
import { get } from 'vuex-pathify';

const SATS = 100000000;

export default {
  components: { Numpad },

  props: {
    amount: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      percent: 0,
      percents: [10, 15, 20],
      custom: false,
      max: 100,
      tip: 0,
    };
  },

  computed: {
    rate: get('rate'),
    user: get('user'),
    fiatTip() {
      return ((this.tip / SATS) * this.rate).toFixed(2);
    },
  },
  
  methods: {
    updateTip(e) {
      this.tip = e;
    },
    done() {
      this.custom = false;
      this.$nextTick(() => {
        console.log(this.tip);
        this.$emit('input', this.tip);
      });
    },
    select(i) {
      this.percent = i;
      this.max = 100;
      this.$nextTick(() => {
        this.$emit('input', this.tip);
      });
    },
  },

  mounted() {
    this.percent = 15;
  },

  watch: {
    percent(v) {
      this.tip = parseInt(v * this.amount * 0.01);
    },
  },
};
</script>

<style lang="stylus" scoped>
.v-btn
  width 100%
  height 62px !important
</style>
