<template>
  <div class="numpad" @keyup="keyup">
    <div class="mb-2">
      <span class="display-1">{{ amount.toFixed(decimals) }}</span>
      <v-btn
        class="toggle black--text ml-2"
        color="yellow"
        @click="$emit('toggle')"
        >{{ currency }}</v-btn
      >
    </div>
    <div class="d-flex" v-for="i in buttons.length / 3" :key="i">
      <v-btn
        class="col-4 ma-1 numpad-button"
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

  data() {
    return {
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
    id(n) {
      let prefix = 'button-';
      if (n === '<') return prefix + 'lt';
      return prefix + n;
    },

    keyup(e) {
      let key = e.keyCode;
      if (key > 57) key -= 48;
      let n = this.codes.indexOf(key).toString();
      if (key === 8) n = '<';
      if (key === 46 || key === 13) n = 'C';
      if (n < 0) return;
      this.update(n);
    },

    update(m) {
      let amount = parseFloat(this.amount);

      if (m === '<') {
        amount =
          Math.floor(this.divisor * (parseFloat(amount) / 10)) / this.divisor;
      } else if (amount < 10000000) {
        amount = 10 * amount + parseFloat(m) / this.divisor;
      }

      if (m === 'C') amount = 0;
      amount = amount.toFixed(this.decimals);
      this.$emit('update', amount);
    },
  },

  created: function() {
    document.addEventListener('keyup', this.keyup);
  },

  destroyed: function() {
    document.removeEventListener('keyup', this.keyup);
  },
};
</script>

<style lang="stylus" scoped>
.toggle
  margin-top -14px
  max-height 30px
  min-width 0

.numpad-button
  height 50px !important
</style>
