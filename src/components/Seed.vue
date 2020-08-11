<template>
  <div class="mb-2 d-flex">
    <v-btn v-if="!show" @click="show = !show" class="flex-grow-1 wide">
      <v-icon left color="yellow">$fire</v-icon>
      View Seed / Backup Account
    </v-btn>
    <v-card v-else class="flex-grow-1">
      <v-card-title>Non-Custodial Wallet Seed</v-card-title>
      <v-card-text>
        <v-text-field label="Seed" :value="seed" readonly>
          <template v-slot:append>
            <v-btn @click="copy(seed)" class="ml-1" icon>
              <v-icon>$copy</v-icon>
            </v-btn>
          </template>
        </v-text-field>
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
    getLoginUrl: call('getLoginUrl'),
    passwordPrompt: call('passwordPrompt'),
  },
  watch: {
    show(v) {
      if (v && !this.seed) this.passwordPrompt();
    },
  },
};
</script>
