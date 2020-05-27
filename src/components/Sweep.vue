<template>
  <div>
    <h1>Sweep Private Key</h1>
    <v-card>
      <v-card-text class="text-center">
        <qr :text="address" />
        <div class="display-2 font-weight-black white--text">
          {{ $format(balance, 0) }}
          <span>SAT</span>
          <div class="fiat yellow--text display-1 my-auto">
            {{ fiat }}
            {{ user.currency }}
          </div>
        </div>
        <v-textarea
          label="Address"
          :value="address"
          rows="1"
          auto-grow
          readonly
        >
          <template v-slot:append>
            <v-btn @click="copy(text)" class="ml-1" icon>
              <v-icon class="mr-1">content_copy</v-icon>
            </v-btn>
          </template>
        </v-textarea>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Qr from './Qr';
import { networks, ECPair, payments } from 'bitcoinjs-lib';

const SATS = 100000000;

export default {
  components: { Qr },
  data() {
    return {
      address: '',
      balance: 0,
      loading: true,
    };
  },
  mixins: [Copy],
  computed: {
    fiat() {
      return ((this.balance * this.rate) / SATS).toFixed(2);
    },
    ecpair: sync('ecpair'),
    error: sync('error'),
    rate: get('rate'),
    user: get('user'),
    text: get('text'),
  },
  async mounted() {
<<<<<<< HEAD
    const text = 'cNJniJnoufoEPnxeM1xAFAZ9WaUBQ5GhxDhmFvQCdLG3V3uB3d9t';
=======
    if (!this.ecpair) this.$go('/send');
>>>>>>> sweep wip
    const network =
      process.env.NODE_ENV === 'production'
        ? networks['bitcoin']
        : networks['regtest'];
<<<<<<< HEAD
    this.ecpair = ECPair.fromWIF(text, network);
=======
>>>>>>> sweep wip
    let { publicKey: pubkey } = this.ecpair;
    let { address } = payments.p2wpkh({ pubkey, network });
    let {
      data: {
        chain_stats: { funded_txo_sum: balance },
      },
    } = await this.axios.get(`/electrs/address/${address}`);
    this.address = address;
    this.balance = balance;
    this.loading = false;
  },
};
</script>
