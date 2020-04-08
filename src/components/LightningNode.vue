<template>
  <v-card class="mb-2">
    <v-card-title>Lightning Node</v-card-title>
    <v-card-text>
      <canvas id="qr" class="d-block mx-auto mb-4" @click="fullscreen" />
      <div class="text-center my-4">
        <code class="black--text" :data-clipboard-text="node">{{ node }}</code>
      </div>
      <v-btn @click="() => copy(node)" class="d-block mx-auto">
        <v-icon class="mr-1">content_copy</v-icon><span>copy</span>
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import qr from 'qrcode';
import Copy from '../mixins/Copy';
import FullScreen from '../mixins/FullScreen';

export default {
  mixins: [Copy, FullScreen],
  data() {
    return {
      node:
        '02868e12f320073cad0c2959c42559fbcfd1aa326fcb943492ed7f02c9820aa399@coinos.io:9735',
    };
  },
  mounted() {
    let canvas = document.getElementById('qr');
    if (!canvas) return;
    qr.toCanvas(canvas, this.node, e => {
      if (e) console.log(e);
    });
  },
};
</script>

<style lang="stylus" scoped>
.v-application code
  max-width 100%
  word-wrap break-word
  font-size 0.8em
</style>
