<template>
    <v-dialog v-model="prompt2fa" max-width="350">
      <v-card>
        <v-card-title class="subheading">2FA Code Required</v-card-title>
        <v-card-text>
          <pincode-input
            class="mx-auto yellow--text"
            v-model="twofa"
            placeholder="0"
            :length="6"
            ref="twofa"
            :key="key"
            />
        </v-card-text>
      </v-card>
    </v-dialog>
    </template>

<script>
import PincodeInput from 'vue-pincode-input';
import { get, call, sync } from 'vuex-pathify';
export default {
  components: { PincodeInput },
  data() {
    return {
      key: 'a',
    } 
  },
  computed: {
    user: get('user'),
    prompt2fa: sync('prompt2fa'),
    twofa: sync('twofa'),
  },
  methods: {
    login: call('login'),
  },
  watch: {
    prompt2fa(v) { 
      this.twofa = '';
      this.key += 'a';
    },
    twofa(v) {
      if (v.length === 6) {
        this.prompt2fa = false;
        this.login(this.user);
      } 
    },
  },
};
</script>
