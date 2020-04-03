<template>
  <div>
    <h1>QR Contents</h1>
    <v-card>
      <v-card-text class="text-center">
        <canvas id="qr" class="d-block mx-auto mb-4" @click="fullscreen" />
        <code class="black--text mb-2" :data-clipboard-text="text">{{
          text
        }}</code>
        <v-btn @click="() => copy(text)" class="d-block mx-auto">
          <v-icon class="mr-1">content_copy</v-icon><span>copy</span>
        </v-btn>
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
    } 
  },
  watch: {
    text(v) {
      this.draw(v);
    } 
  },
  mounted() {
    this.draw(this.text);
  } 
};
</script>
