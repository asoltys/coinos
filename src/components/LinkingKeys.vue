<template>
  <v-card v-if="user.keys.length" class="mb-2">
    <v-card-title>Linking Keys</v-card-title>
    <v-card-text>
      <v-list class="elevation-1 mb-2">
        <v-list-item v-for="{ hex } in user.keys" :key="hex" @click="copy(hex)">
          <v-list-item-avatar>
            <v-icon color="yellow">vpn_key</v-icon>
            </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ hex }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn @click="copy(hex)" icon>
              <v-icon>content_copy</v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-action>
            <v-btn @click="del(hex)" icon>
              <v-icon>delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <div v-if="result">
        <qr :text="result.encoded" />
        <v-textarea
          v-if="result.encoded"
          label="LNURL"
          :value="result.encoded"
          rows="1"
          auto-grow
          readonly
        >
          <template v-slot:append>
            <v-btn @click="() => copy(result.encoded)" icon class="ml-1">
              <v-icon>content_copy</v-icon>
            </v-btn>
          </template>
        </v-textarea>
      </div>
      <v-btn @click="add">
        <v-icon left class="yellow--text">add</v-icon>
        <span>Add</span>
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import { get, call } from 'vuex-pathify';
import Qr from './Qr';
import Copy from '../mixins/Copy';

export default {
  components: { Qr },
  mixins: [Copy],
  data() {
    return {
      result: null,
    };
  },
  computed: {
    user: get('user'),
  },
  methods: {
    del(hex) {
      this.user.keys.splice(this.user.keys.findIndex(k => k.hex === hex), 1);
      this.deleteLinkingKey(hex);
    },
    deleteLinkingKey: call('deleteLinkingKey'),
    getLoginUrl: call('getLoginUrl'),
    async add() {
      this.result = await this.getLoginUrl();
    },
  },
};
</script>
