<template>
  <div>
    <h1>Sweep Private Key</h1>
    <v-card>
      <v-card-text class="text-center">
        <qr :text="text" />
        <div class="mb-2 text-center no-print">
          <div class="d-flex">
            <div
              class="display-2 font-weight-black flex-grow-1 text-right mr-2"
            >
              {{ $format(balance, 0) }}
            </div>
            <span>SAT</span>
          </div>
          <h3 class="d-flex flex-wrap justify-center">
            <div class="fiat yellow--text display-1 my-auto">
              {{ fiat }}
            </div>
            <div class="mx-1">
              {{ user.currency }}
            </div>
          </h3>
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
      return (this.balance * this.rate / SATS).toFixed(2);
    },
    ecpair: sync('ecpair'),
    error: sync('error'),
    rate: get('rate'),
    user: get('user'),
    text: get('text'),
  },
  async mounted() {
      const text = 'cU4ejx1GSkG717knJAcvyNBnUxJruuyXsitVx4YBQg8no8KuiyUn';
        const network =
          process.env.NODE_ENV === 'production'
            ? networks['bitcoin']
            : networks['regtest'];
        console.log(network);
        this.ecpair = ECPair.fromWIF(text, network);
      console.log(this.ecpair);
      let { publicKey: pubkey } = this.ecpair;
      let p2wpkh = payments.p2wpkh({ pubkey, network })
      console.log(p2wpkh);
      let res = await this.axios.get('/bitcoin/address', p2wpkh.address);
      this.balance = res.data.balance;
      this.utxos = res.data.utxos;
    console.log('oy');
    this.loading = false;
  },
};
</script>
