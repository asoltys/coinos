<template>
    <div v-if="lnurl && lnurl.encoded">
      <qr :text="lnurl.encoded" />
      <div class="d-flex justify-center">
        <v-btn @click="window.location = `lightning:${lnurl.encoded}`">
          <v-icon left color="yellow">open_in_new</v-icon>
          Open
        </v-btn>
      </div>
      <v-textarea
        label="LNURL"
        :value="lnurl.encoded"
        rows="1"
        auto-grow
        readonly
      >
        <template v-slot:append>
          <v-btn @click="() => copy(lnurl.encoded)" icon class="ml-1">
            <v-icon>content_copy</v-icon>
          </v-btn>
        </template>
      </v-textarea>
    </div>
    </template>

<script>
import Qr from './Qr';
import Copy from '../mixins/Copy';
import { call } from 'vuex-pathify';

export default {
  components: { Qr },
  mixins: [Copy],
  props: {
    lnurl: { type: Object, default: null },
  },
  methods: {
    createCode: call('createCode'),
  },
  mounted() {
    this.createCode(this.lnurl);
  },
};
</script>
