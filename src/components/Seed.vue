<template>
  <div class="mb-2 d-flex">
    <v-btn v-if="!show" @click="show = !show" class="flex-grow-1 wide">
      <v-icon left color="primary">$fire</v-icon>
      View Seed / Backup Account
    </v-btn>
    <v-card v-else class="flex-grow-1">
      <v-card-title>Default Wallet Seed</v-card-title>
      <v-card-text>
        <v-alert color="#333">
          <v-icon left>$info</v-icon>
          <span>Non-custodial wallets in your account will be derived from this seed by default but you can provide/generate custom seeds per account if you like. Take care to back them up separately if you do.</span>
        </v-alert>
        <v-textarea label="Seed" :value="seed" readonly rows="1" auto-grow>
          <template v-slot:append>
            <v-btn @click="copy(seed)" class="ml-1" icon>
              <v-icon>$copy</v-icon>
            </v-btn>
          </template>
        </v-textarea>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { get, call } from 'vuex-pathify';
import Copy from '../mixins/Copy';

export default {
  mixins: [Copy],
  data: () => ({
    show: false,
  }),
  computed: {
    seed: get('seed'),
  },
  methods: {
    del(hex) {
      this.user.keys.splice(
        this.user.keys.findIndex(k => k.hex === hex),
        1
      );
      this.deleteLinkingKey(hex);
    },
    deleteLinkingKey: call('deleteLinkingKey'),
    lnurlAuth: call('lnurlAuth'),
    passwordPrompt: call('passwordPrompt'),
  },
  watch: {
    show(v) {
      if (v && !this.seed) this.passwordPrompt();
    },
  },
};
</script>
