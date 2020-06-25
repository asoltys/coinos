<template>
  <div>
    <h1 class="mb-2">What's the password?</h1>
    <v-progress-linear v-if="percent" indeterminate />
    <v-form v-else @submit.prevent="decrypt">
      <v-text-field
        class="my-4"
        label="Private Key Decryption Password (BIP38)"
        v-model="password"
        :type="show ? 'text' : 'password'"
        ref="password"
      >
        <template v-slot:append> </template>
      </v-text-field>
      <v-btn type="submit" class="black--text ml-1" color="primary">
        <v-icon left>send</v-icon>
        Go
      </v-btn>
    </v-form>
  </div>
</template>

<script>
import bip38 from 'bip38';
import { call, get, sync } from 'vuex-pathify';
import wif from 'wif';

export default {
  data() {
    return {
      password: '',
      percent: 0,
      show: false,
    };
  },
  computed: {
    error: sync('error'),
    text: get('text'),
  },
  methods: {
    handleScan: call('handleScan'),
    async decrypt() {
      try {
        let result = await bip38.decryptAsync(
          this.text,
          this.password,
          status => (this.percent = parseInt(status.percent))
        );
        this.handleScan(
          wif.encode(this.$network.wif, result.privateKey, result.compressed)
        );
      } catch (e) {
        this.error = 'Failed to decrypt private key';
        this.percent = 0;
      }
    },
  },
  mounted() {
    this.$refs.password.focus();
  },
};
</script>
