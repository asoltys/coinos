<template>
  <div v-if="user.keys && user.keys.length" class="mb-2 d-flex">
    <v-btn v-if="!show" @click="show = !show" class="wide flex-grow-1">
      <v-icon left color="yellow">$key</v-icon> 
      Auth Keys
    </v-btn>
  <v-card v-else class="flex-grow-1">
    <v-card-title>JWT Auth Token</v-card-title>
    <v-card-text>
      <v-list class="elevation-1 mb-2">
        <v-list-item @click="copy(token)">
          <v-icon color="yellow" left>$key</v-icon>
          <v-list-item-content>
            <v-list-item-title>{{ token }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn @click="copy(token)" icon>
              <v-icon>$copy</v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-action>
            <v-btn @click.stop.prevent="link" icon>
              <v-icon>$link</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-title>LNURL Auth Keys</v-card-title>
    <v-card-text>
      <v-list class="elevation-1 mb-2">
        <v-list-item v-for="{ hex } in user.keys" :key="hex" @click="copy(hex)">
          <v-icon color="yellow" left>$key</v-icon>
          <v-list-item-content>
            <v-list-item-title>{{ hex }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn @click="copy(hex)" icon>
              <v-icon>$copy</v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-action>
            <v-btn @click="del(hex)" icon>
              <v-icon>$delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
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
      this.user.keys.splice(this.user.keys.findIndex(k => k.hex === hex), 1);
      this.deleteLinkingKey(hex);
    },
    deleteLinkingKey: call('deleteLinkingKey'),
    getLoginUrl: call('getLoginUrl'),
  },
};
</script>
