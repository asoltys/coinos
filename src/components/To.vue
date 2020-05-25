<template>
  <div>
    <v-form v-if="!payment.method || ['bitcoin', 'liquid', 'lightning'].includes(payment.method)">
      <v-textarea
        class="my-4"
        :label="label"
        dark
        v-model="to"
        clearable
        auto-grow
        rows="1"
        hide-details
        @input="handleScan(to)"
        ref="to"
        :error="!!to && to.length > 0"
      >
        <template v-slot:append>
          <div v-if="to.length">
            <v-btn icon @click="showText(to)" class="ml-1" text>
              <qrcode />
            </v-btn>
            <v-btn @click="copy(to)" class="ml-1" icon>
              <v-icon class="mr-1">content_copy</v-icon>
            </v-btn>
          </div>

          <v-btn v-if="canPaste" class="mr-2 mb-2 flex-grow-1" @click="paste">
            <v-icon class="mr-1">assignment</v-icon>
            <span>Paste</span>
          </v-btn>
        </template>
      </v-textarea>
    </v-form>

    <methods v-if="!payment.method" />

    <v-form @submit.prevent="sendToUser" v-if="payment.method === 'coinos'">
      <v-text-field
        class="my-4"
        label="Username:"
        v-model="username"
        clearable
      />
      <div class="d-flex">
        <v-btn
          class="flex-grow-1 ml-1 black--text"
          color="primary"
          @click="sendToUser"
        >
          <v-icon class="mr-1">send</v-icon>
          Go
        </v-btn>
      </div>
    </v-form>
    <paper v-if="payment.method === 'paper'" />
    <v-btn v-if="payment.method" @click="payment.method = null" class="mt-2">
      <v-icon>arrow_back</v-icon>
      Back</v-btn
    >
  </div>
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Qrcode from 'vue-material-design-icons/Qrcode';
import { generateMnemonic } from 'bip39';
import Flash from 'vue-material-design-icons/Flash';
import Water from 'vue-material-design-icons/Water';
import Paper from './Paper';
import Methods from './Methods';

export default {
  components: { Paper, Qrcode, Methods },
  mixins: [Copy],
  data() {
    return {
      username: '',
      to: '',
    };
  },
  computed: {
    label() {
      switch (this.payment.method) {
        case 'lightning':
          return 'Invoice';
        case 'bitcoin':
          return 'Address';
        case 'lightning':
          return 'Address';
        default:
          return 'Paste an Address, Key, Invoice, Username, BOLT11, BIP21...';
      }
    },
    networks: get('networks'),
    canPaste: () => navigator.clipboard,
    payment: sync('payment'),
  },
  methods: {
    generate() {
      this.seed = generateMnemonic();
    },
    getRecipient: call('getRecipient'),
    handleScan: call('handleScan'),
    sendToUser() {
      this.getRecipient(this.username);
      this.$emit('edit');
    },
    showText: call('showText'),
    async paste() {
      this.to = await navigator.clipboard.readText();
      this.handleScan(this.to);
    },
  },
  mounted() {
    const vw = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    if (vw > 600 && this.$refs.to) this.$refs.to.focus();
  },
};
</script>

