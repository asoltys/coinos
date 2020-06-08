<template>
  <v-card class="pa-4">
    <v-form @submit.prevent="sendPayment">
      <div class="no-print">
        <v-textarea label="Seed" v-model="seed" rows="1" auto-grow>
          <template v-slot:append>
            <v-btn @click="copy(seed)" class="ml-1" icon>
              <v-icon class="mr-1">content_copy</v-icon>
            </v-btn>
            <v-btn icon @click="generate" class="ml-1" text>
              <v-icon>refresh</v-icon>
            </v-btn>
          </template>
        </v-textarea>
      </div>
      <qr :text="address" />
      <v-textarea label="Address" v-model="address" rows="1" auto-grow>
        <template v-slot:append>
          <v-btn @click="copy(address)" class="ml-1" icon>
            <v-icon class="mr-1">content_copy</v-icon>
          </v-btn>
        </template>
      </v-textarea>

      <div :style="{ backgroundColor: encrypting ? 'gray' : null }">
        <qr
          :text="encrypted || privkey"
          :style="{ visibility: encrypting ? 'hidden' : 'visible' }"
        />
      </div>

      <v-textarea
        label="Private Key"
        :value="encrypted || privkey"
        readonly
        :loading="encrypting > 0"
        rows="1"
        auto-grow
      >
        <template v-slot:append>
          <v-btn v-if="1 === 2" @click="compressed = !compressed" class="ml-1">
            <template v-if="compressed">
              <v-icon class="mr-1">unfold_more</v-icon>
              Uncompress
            </template>
            <template v-else>
              <v-icon class="mr-1">unfold_less</v-icon>
              Compress
            </template>
          </v-btn>
          <v-btn @click="copy(encrypted || privkey)" class="ml-1" icon>
            <v-icon class="mr-1">content_copy</v-icon>
          </v-btn>
        </template>
      </v-textarea>
      <div class="no-print">
        <v-text-field
          class="my-4"
          label="Private Key Encryption Password (BIP38)"
          v-model="password"
          :type="show ? 'text' : 'password'"
        />
      </div>
      <div class="d-flex flex-wrap no-print">
        <v-btn class="ml-auto mr-2 mb-2 mb-sm-0 wide" @click="print">
          <printer class="mr-1" />
          <span>Print</span>
        </v-btn>
        <v-btn @click="handleScan(address)" class="wide">
          <v-icon left color="green">send</v-icon>
          <span>Fund</span>
        </v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script>
import 'setimmediate';
import { call } from 'vuex-pathify';
import { generateMnemonic } from 'bip39';
import Copy from '../mixins/Copy';
import Qr from './Qr';
import {
  address,
  crypto,
  ECPair,
  networks,
  payments,
  script,
} from 'bitcoinjs-lib';
import bip38 from 'bip38';
import wif from 'wif';
import Printer from 'vue-material-design-icons/Printer';

const network =
  process.env.NODE_ENV === 'production'
    ? networks['bitcoin']
    : networks['regtest'];

export default {
  components: { Qr, Printer },
  mixins: [Copy],
  data() {
    return {
      compressed: true,
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
      return ECPair.fromPrivateKey(hash, {
        compressed: this.compressed,
        network,
      });
    },
    address() {
      const { address } = payments.p2wpkh({
        pubkey: this.keyPair.publicKey,
        network,
      });
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
    handleScan: call('handleScan'),
    generate() {
      this.seed = generateMnemonic();
    },
  },
  watch: {
    password(v) {
      clearTimeout(this.encrypting);
      if (!v) return (this.encrypted = '');

      this.encrypted = 'Encrypting...';
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
