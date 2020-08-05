<template>
  <div>
    <h1>QR Code</h1>
    <v-card>
      <v-card-text class="text-center">
        <qr :text="text" />
        <v-textarea
          label="QR Contents"
          :value="text"
          rows="1"
          auto-grow
          readonly
        >
          <template v-slot:append>
            <v-btn @click="copy(text)" class="ml-1" icon>
              <v-icon>$copy</v-icon>
            </v-btn>
          </template>
        </v-textarea>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Qr from './Qr';

export default {
  components: { Qr },
  mixins: [Copy],
  computed: {
    text: get('text'),
  },
};
</script>
