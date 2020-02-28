<template>
    <v-dialog :value="prompt2fa" max-width="350">
      <v-card>
        <v-card-title class="subheading">2FA Code Required</v-card-title>
        <v-card-text>
          <v-layout>
            <pincode-input
              class="mx-auto yellow--text"
              v-model="twofa"
              placeholder="0"
              :length="6"
              ref="twofa"
            />
          </v-layout>
        </v-card-text>
      </v-card>
    </v-dialog>
    </template>

<script>
import PincodeInput from 'vue-pincode-input';
import { get, sync } from 'vuex-pathify';
export default {
  components: { PincodeInput },
  computed: {
    prompt2fa: sync('prompt2fa'),
    twofa: sync('twofa'),
  },
  watch: {
    twofa(v) {
      if (v.length === 6) this.prompt2fa = false;
    },
  },
};
</script>
