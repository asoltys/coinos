<template>
  <div class="numpad mr-2 pl-0" @keyup.prevent="keyup">
    <div class="d-flex mb-2">
      <input
        class="display-1"
        v-model="inputAmount"
        @focus="e => e.target.select()"
        @keyup.enter="done"
      />
      <v-btn
        class="toggle black--text ml-2 mt-auto"
        color="yellow"
        @click.prevent="toggle"
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
import { get, call, sync } from 'vuex-pathify';
const f = parseFloat;
const SATS = 100000000;

export default {
  filters: {
    format(n, d) {
      return f(n).toLocaleString('en-US', {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      });
    },
  },

  data() {
    return {
      sats: 0,
      inputAmount: '_',
      buttons: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '<', '0', 'C'],
      codes: Array.from(Array(10), (_, x) => x + 48),
    };
  },

  computed: {
    currency() {
      return this.fiat ? this.user.currency : 'sat';
    },
    amount: sync('amount'),
    fiat: sync('fiat'),
    rate: get('rate'),
    user: get('user'),
    decimals() {
      return this.fiat ? 2 : 0;
    },
    divisor() {
      return 10 ** this.decimals;
    },
  },

  methods: {
    done(e) {
      let amount = e.target.value;
      if (this.fiat)
        this.amount = parseInt(((amount * SATS) / this.rate).toFixed(8));
      else this.amount = parseInt(amount);
      this.$emit("done");
    },
    shiftCurrency: call('shiftCurrency'),

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

    async toggle() {
      let { currency, currencies } = this.user;
      if (!currency) return;
      if (!Array.isArray(currencies)) currencies = JSON.parse(currencies);
      let index = currencies.findIndex(c => c === currency);

      if (this.fiat) {
        if (index === currencies.length - 1) this.fiat = false;
        await this.shiftCurrency();
        this.$nextTick(() => {
          if (this.fiat)
            this.inputAmount = ((this.amount / SATS) * this.rate).toFixed(2);
          else this.inputAmount = this.amount.toFixed(0);
        });
      } else {
        this.inputAmount = ((this.amount / SATS) * this.rate).toFixed(2);
        this.fiat = true;
      }
    },

    update(m) {
      let amount = f(this.inputAmount);
      if (isNaN(amount)) amount = 0;

      if (m === '<') {
        amount = Math.floor(this.divisor * (f(amount) / 10)) / this.divisor;
      } else {
        amount = 10 * amount + f(m) / this.divisor;
      }

      if (m === 'C') amount = 0;
      this.inputAmount = amount.toFixed(this.decimals);
      if (this.fiat)
        this.amount = parseInt(((amount * SATS) / this.rate).toFixed(8));
      else this.amount = parseInt(amount);
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
    if (this.fiat)
      this.inputAmount = ((this.amount / SATS) * this.rate).toFixed(2);
    if (f(this.inputAmount) === 0) this.inputAmount = '_';
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
  height 10vh !important
  font-size 18px
  font-weight bolder
</style>
