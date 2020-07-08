<template>
    <div>
      <qr :text="result.encoded" />
      <div class="d-flex justify-center">
        <v-btn @click="window.location = `lightning:${result.encoded}`">
          <v-icon left color="yellow">open_in_new</v-icon>
          Open
        </v-btn>
      </div>
      <v-textarea
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
    </template>

<script>
import Qr from './Qr';
import Copy from '../mixins/Copy';

export default {
  components: { Qr },
  mixins: [Copy],
  props: {
    result: { type: Object, default: null },
  },
};
</script>
