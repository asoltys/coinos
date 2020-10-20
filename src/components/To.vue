<template>
  <div>
    <v-form
      v-if="
        !payment.method ||
          ['bitcoin', 'liquid', 'lightning'].includes(payment.method)
      "
    >
      <v-textarea
        class="my-4"
        label="Address, Key, Invoice, Username or URL"
        v-model="to"
        auto-grow
        rows="1"
        @input="handleScan(to)"
        @keyup.native.enter="getRecipient(to)"
        ref="to"
        :error="!!to && to.length > 0"
      >
        <template v-slot:append>
          <div class="d-flex flex-wrap">
            <v-btn
              v-if="to.length"
              class="mr-2 mb-2 flex-grow-1"
              @click="showText(to)"
            >
              <v-icon>$qrcode</v-icon>
            </v-btn>

    <v-btn v-if="to.length" class="mr-2 mb-2 flex-grow-1" @click="getRecipient(to)">
      <v-icon color="primary">$search</v-icon>
    </v-btn>

            <v-btn v-if="canPaste" class="mr-2 mb-2 flex-grow-1" @click="paste">
              <v-icon :left="!to.length">$assignment</v-icon>
              <span v-if="!to.length">Paste</span>
            </v-btn>

          </div>
        </template>
      </v-textarea>
    </v-form>


    <methods v-if="!payment.method" />
    <paper v-if="payment.method === 'paper'" />
    <voucher v-if="payment.method === 'url'" />
    <swap v-if="payment.method === 'swap'" />
    <v-btn
      v-if="payment.method"
      @click="payment.method = null"
      class="my-2 wide"
    >
      <v-icon>$left</v-icon>
      Back</v-btn
    >
  </div>
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Paper from './Paper';
import Swap from './Swap';
import Voucher from './Voucher';
import Methods from './Methods';

export default {
  components: { Voucher, Paper, Methods, Swap },
  mixins: [Copy],
  props: {
    text: { type: String, default: '' },
  },
  data() {
    return {
      to: '',
    };
  },
  computed: {
    canPaste: () => navigator.clipboard,
    payment: sync('payment'),
  },
  methods: {
    getRecipient: call('getRecipient'),
    generate() {
      this.seed = generateMnemonic();
    },
    handleScan: call('handleScan'),
    showText: call('showText'),
    async paste() {
      this.to = await navigator.clipboard.readText();
      this.handleScan(this.to);
    },
  },
  mounted() {
    if (this.text) this.to = this.text;

    const vw = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    if (vw > 600 && this.$refs.to) this.$refs.to.focus();
  },
};
</script>

<style lang="stylus" scoped>
@media (max-width: 600px)
  .buttons .v-btn
    max-width none
    width 100%
    height 62px !important

.buttons .v-btn
  height 8vh !important
  min-height 60px
</style>
