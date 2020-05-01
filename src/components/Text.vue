<template>
  <div>
    <h1>QR Code</h1>
    <v-card>
      <v-card-text class="text-center">
        <canvas id="qr" class="d-block mx-auto mb-4" @click="fullscreen" />
        <v-textarea
          label="QR Contents"
          :value="text"
          rows="1"
          auto-grow
          readonly
        >
          <template v-slot:append>
            <v-btn @click="() => copy(text)" class="ml-1" icon>
              <v-icon class="mr-1">content_copy</v-icon>
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
import FullScreen from '../mixins/FullScreen';

import qr from 'qrcode';

export default {
  mixins: [Copy, FullScreen],
  computed: {
    text: get('text'),
  },
  methods: {
    draw(v) {
      let canvas = document.getElementById('qr');
      if (!canvas) return;
      qr.toCanvas(canvas, v, e => {
        if (e) console.log(e);
      });
    },
  },
  watch: {
    text(v) {
      this.draw(v);
    },
  },
  mounted() {
    this.draw(this.text);
  },
};
</script>
