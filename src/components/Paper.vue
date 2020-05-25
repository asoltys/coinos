<template>
  <v-form @submit.prevent="sendPayment">
    <v-text-field label="Seed" v-model="seed">
      <template v-slot:append>
        <v-btn @click="copy(seed)" class="ml-1" icon>
          <v-icon class="mr-1">content_copy</v-icon>
        </v-btn>
        <v-btn icon @click="generate" class="ml-1" text>
          <v-icon>refresh</v-icon>
        </v-btn>
      </template>
    </v-text-field>
    <qr :text="address" />
    <v-text-field label="Address" v-model="address">
      <template v-slot:append>
        <v-btn @click="copy(address)" class="ml-1" icon>
          <v-icon class="mr-1">content_copy</v-icon>
        </v-btn>
      </template>
    </v-text-field>
    <qr :text="encrypted || privkey" />
    <v-text-field
      label="Private Key"
      :value="encrypted || privkey"
      readonly
      :loading="encrypting > 0"
    >
      <template v-slot:append>
        <v-btn @click="compressed = !compressed" class="ml-1" icon>
          <v-icon class="mr-1">assignment</v-icon>
        </v-btn>
        <v-btn @click="copy(encrypted || privkey)" class="ml-1" icon>
          <v-icon class="mr-1">content_copy</v-icon>
        </v-btn>
      </template>
    </v-text-field>
    <div class="no-print">
      <v-text-field
        class="my-4"
        label="Private Key BIP38 Encryption Password"
        v-model="password"
        :type="show ? 'text' : 'password'"
      />
    </div>
    <div class="d-flex">
      <v-btn class="ml-auto" @click="print">
        <v-icon class="mr-1">printer</v-icon>
        <span>Print</span>
      </v-btn>
    </div>
  </v-form>
</template>

<script>
import 'setimmediate';
import { call } from 'vuex-pathify';
import { generateMnemonic } from 'bip39';
import Copy from '../mixins/Copy';
import Qr from './Qr';
import { address, crypto, ECPair, payments, script } from 'bitcoinjs-lib';
import bigi from 'bigi';
import bip38 from 'bip38';
import wif from 'wif';

export default {
  components: { Qr },
  mixins: [Copy],
  data() {
    return {
      compressed: false,
      password: '',
      seed: '',
      show: false,
      encrypting: false,
      encrypted: '',
    };
  },
  computed: {
    keyPair() {
      const hash = crypto.sha256(this.seed);
      const d = bigi.fromBuffer(hash);
      return ECPair.fromPrivateKey(hash, { compressed: this.compressed });
    },
    address() {
      const { address } = payments.p2wpkh({ pubkey: this.keyPair.publicKey });
      return address;
    },
    privkey() {
      return this.keyPair.toWIF();
    },
  },
  methods: {
    print() {
      window.print();
    },
    sendPayment: call('sendPayment'),
    generate() {
      this.seed = generateMnemonic();
    },
  },
  watch: {
    password(v) {
      clearTimeout(this.encrypting);
      if (!v) return (this.encrypted = '');

      this.encrypting = setTimeout(async () => {
        let decoded = wif.decode(this.privkey);
        this.encrypted = await bip38.encryptAsync(
          decoded.privateKey,
          decoded.compressed,
          v
        );
        this.encrypting = false;
      }, 1000);
    },
  },
  mounted() {
    this.generate();
  },
};
</script>
