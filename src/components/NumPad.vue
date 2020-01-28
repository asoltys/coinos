<template>
  <div class="numpad mr-2 pl-0" @keyup.prevent="keyup">
    <div class="d-flex mb-2">
      <input
        class="display-1"
        v-model="inputAmount"
        @change.prevent="parseAmount"
        @focus="e => e.target.select()"
        @keyup.enter="$emit('lightning')"
      />
      <v-btn
        class="toggle black--text ml-2 mt-auto"
        color="yellow"
        @click.prevent="$emit('toggle')"
        >{{ currency }}</v-btn
      >
    </div>
    <div class="d-flex" v-for="i in buttons.length / 3" :key="i">
      <v-btn
        class="col-4 my-1 ml-0 mr-2 numpad-button"
        v-for="j in 3"
        :key="j"
        @click="update(buttons[j + 3 * i - 4])"
        :ref="id(buttons[j + 3 * i - 4])"
      >
        <template v-if="buttons[j + 3 * i - 4] !== '<'">{{
          buttons[j + 3 * i - 4]
        }}</template>
        <v-icon v-else>undo</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'CAD',
    },
  },

  filters: {
    format(n, d) {
      return parseFloat(n).toLocaleString('en-US', {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      });
    },
  },

  data() {
    return {
      inputAmount: '_',
      buttons: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '<', '0', 'C'],
      codes: Array.from(Array(10), (_, x) => x + 48),
    };
  },

  computed: {
    decimals() {
      return this.currency === 'sat' ? 0 : 2;
    },
    divisor() {
      return 10 ** this.decimals;
    },
  },

  methods: {
    parseAmount(e) {
      if (this.currency === 'sat') {
        this.inputAmount = parseInt(e.target.value);
      } else {
        this.inputAmount = parseFloat(e.target.value).toFixed(2);
      }

      if (isNaN(this.inputAmount) || parseFloat(this.inputAmount) === 0)
        this.inputAmount = '_';
      this.$emit('update', this.inputAmount);
    },

    id(n) {
      let prefix = 'button-';
      if (n === '<') return prefix + 'lt';
      return prefix + n;
    },

    keyup(e) {
      if (e.target.nodeName === 'INPUT') return;
      let key = e.keyCode;
      if (key > 57) key -= 48;
      let n = this.codes.indexOf(key).toString();
      if (key === 8) n = '<';
      if (key === 46) n = 'C';
      if (n < 0) return;
      this.update(n);
    },

    update(m) {
      let amount = parseFloat(this.amount);

      if (m === '<') {
        amount =
          Math.floor(this.divisor * (parseFloat(amount) / 10)) / this.divisor;
      } else {
        amount = 10 * amount + parseFloat(m) / this.divisor;
      }

      if (m === 'C') amount = 0;
      amount = amount.toFixed(this.decimals);
      this.inputAmount = amount;
      if (parseFloat(this.inputAmount) === 0) this.inputAmount = '';
      this.$emit('update', amount);
    },
  },

  watch: {
    amount(v) {
      if (this.currency === 'sat') this.inputAmount = parseInt(v);
      else this.inputAmount = parseFloat(v).toFixed(2);
      if (parseFloat(v) === 0) this.inputAmount = '_';
    },
  },

  created: function() {
    document.addEventListener('keyup', this.keyup);
  },

  destroyed: function() {
    document.removeEventListener('keyup', this.keyup);
  },

  mounted() {
    this.inputAmount = this.amount;
    if (parseFloat(this.inputAmount) === 0) this.inputAmount = '_';
  },
};
</script>

<style lang="stylus" scoped>
input
  cursor pointer
  width 100%

.toggle
  margin-top -16px
  max-height 28px
  min-width 0

.numpad-button
  height 50px !important
</style>
