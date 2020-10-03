<template>
  <v-dialog
    v-if="tipping"
    v-model="tipping"
    :fullscreen="$vuetify.breakpoint.xsOnly"
    @click:outside="done"
    class="my-auto"
    width="500"
    style="height: 100%"
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar dark color="black">
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn text @click="done">
            <v-icon left color="yellow">$check</v-icon><span>Done</span>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <div v-if="custom">
        <numpad
           @input="updateTip"
           :initialAmount="tip"
           :initialRate="invoice.rate"
           :currencies="[invoice.currency, 'SAT', 'BTC']"
           />
        <div class="d-flex my-2">
          <v-btn
             class="flex-grow-1"
             @click="done"
             >
             <v-icon left color="yellow">$check</v-icon><span>Done</span>
          </v-btn>
        </div>
      </div>
      <div v-else>
        <div class="d-flex display-1 text-center justify-center">
          <div class="flex-grow-1">
            {{ tip }} <span class="body-1">{{ ticker }}</span>
          </div>
          <div class="flex-grow-1">{{ percent }}%</div>
          <div
               v-if="user.account.ticker === 'BTC'"
               class="flex-grow-1 yellow--text"
               >
               {{ fiatTip }} <span class="body-1">{{ invoice.currency }}</span>
          </div>
        </div>
        <v-slider v-model="percent" min="0" :max="max" />
          <v-btn v-for="i in percents" class="mb-2" @click="select(i)" :key="i">
            <span>{{ i }}%</span>
          </v-btn>
          <v-btn class="mb-2" @click="custom = true">
            <span>Custom</span>
          </v-btn>
          <v-btn class="mb-2" @click="select(0)">
            <span>None</span>
          </v-btn>
          <div class="text-center">
            <v-btn class="mb-2 ok" @click="done">
              <v-icon left color="primary">$check</v-icon>
              <span>Done</span>
            </v-btn>
          </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import Numpad from './NumPad';
import { get } from 'vuex-pathify';

const SATS = 100000000;

export default {
  props: {
    tipping: { type: Boolean, default: false },
  },

  components: { Numpad },

  data() {
    return {
      fiatTip: 0,
      percent: 0,
      percents: [10, 15, 20],
      custom: false,
      customKey: '',
      max: 100,
      tip: 0,
    };
  },

  computed: {
    isBtc() {
      return this.user.account.ticker === 'BTC';
    },
    ticker() {
      return this.isBtc ? this.user.unit : this.user.account.ticker;
    },
    invoice: get('invoice'),
    user: get('user'),
  },

  methods: {
    done() {
      this.custom = false;
      this.$emit('input', this.tip, this.fiatTip);
    },
    updateTip(tip, fiatTip) {
      let percent = Math.round(tip / (this.amount * 0.01));
      if (percent > this.max) this.max = percent;
      this.tip = tip;
      this.fiatTip = fiatTip;
    },
    select(i) {
      this.percent = i;
      this.max = 100;
      this.$nextTick(() => {
        this.$emit('input', this.tip, this.fiatTip);
      });
    },
  },

  mounted() {
    if (this.invoice.tip) {
      let percent = Math.round(this.invoice.tip / (this.invoice.amount * 0.01));
      if (percent > this.max) this.max = percent;
      this.percent = percent;

      this.$nextTick(() => {
        this.tip = this.invoice.tip;
        this.fiatTip = this.invoice.fiatTip;
      });
    } else this.percent = 15;
  },

  watch: {
    percent(v) {
      this.tip = Math.round(v * this.invoice.amount * 0.01);
      this.fiatTip = ((this.tip / SATS) * this.invoice.rate).toFixed(2);
    },
  },
};
</script>

<style lang="stylus" scoped>
.v-btn
  width 100%
  height 62px !important

.ok
  width 50%
</style>
