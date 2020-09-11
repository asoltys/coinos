<template>
  <div v-if="user.keys && user.keys.length" class="mb-2 d-flex">
    <v-btn v-if="!show" @click="show = !show" class="wide flex-grow-1">
      <v-icon left color="yellow">$key</v-icon>
      Auth Keys
    </v-btn>
    <v-card v-else class="flex-grow-1">
      <v-card-text>
        <v-textarea label="JWT Auth Token" v-model="token" rows="1" auto-grow readonly>
          <template v-slot:prepend>
            <v-icon color="yellow" left>$key</v-icon>
          </template>
          <template v-slot:append>
            <v-btn @click="copy(token)" icon class="ml-1" title="Copy">
              <v-icon>$copy</v-icon>
            </v-btn>
            <v-btn @click.stop.prevent="link" icon title="Login Link">
              <v-icon>$link</v-icon>
            </v-btn>
          </template>
        </v-textarea>
        <v-textarea
          v-for="{ hex } in user.keys"
          label="LNURL Auth Key"
          :value="hex"
          rows="1"
          auto-grow
          :key="hex"
          readonly
        >
          <template v-slot:prepend>
            <v-icon color="yellow" left>$key</v-icon>
          </template>
          <template v-slot:append>
            <v-btn @click="copy(hex)" icon class="ml-1" title="Copy">
              <v-icon>$copy</v-icon>
            </v-btn>
          </template>
        </v-textarea>
        <lnurl v-if="lnurl" :lnurl="lnurl" />
        <v-btn v-else @click="getLoginUrl">
          <v-icon left class="yellow--text">$add</v-icon>
          <span>Add New</span>
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { get, call } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Lnurl from './Lnurl';

export default {
  components: { Lnurl },
  mixins: [Copy],
  data: () => ({
    show: false,
  }),
  computed: {
    token: get('token'),
    lnurl: get('lnurl'),
    user: get('user'),
  },
  methods: {
    link() {
      this.copy(`${window.location.origin}/login/${this.token}`);
    },
    del(hex) {
      this.user.keys.splice(
        this.user.keys.findIndex(k => k.hex === hex),
        1
      );
      this.deleteLinkingKey(hex);
    },
    deleteLinkingKey: call('deleteLinkingKey'),
    getLoginUrl: call('getLoginUrl'),
  },
};
</script>
