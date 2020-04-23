<template>
  <v-card class="mb-2">
    <v-card-title>Lightning Node</v-card-title>
    <v-card-text>
      <canvas
        v-if="qrText"
        id="qr"
        class="d-block mx-auto mb-4"
        @click="fullscreen"
      />
      <div class="text-center my-4">
        <v-textarea
          label="Clearnet"
          v-model="clearnet"
          readonly
          auto-grow
          class="body-2"
          rows="1"
        >
          <template v-slot:append>
            <v-btn icon @click="() => qr(clearnet)" class="ml-1" text>
              <qrcode />
            </v-btn>
            <v-btn icon @click="() => copy(clearnet)" class="ml-1" text>
              <v-icon>content_copy</v-icon>
            </v-btn>
          </template>
        </v-textarea>
        <v-textarea
          label="Darknet"
          v-model="darknet"
          readonly
          auto-grow
          class="body-2"
          rows="1"
        >
          <template v-slot:append>
            <v-btn icon @click="() => qr(darknet)" class="ml-1" text>
              <qrcode />
            </v-btn>
            <v-btn icon @click="() => copy(darknet)" class="ml-1" text>
              <v-icon>content_copy</v-icon>
            </v-btn>
          </template>
        </v-textarea>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import qr from 'qrcode';
import Copy from '../mixins/Copy';
import FullScreen from '../mixins/FullScreen';
import Qrcode from 'vue-material-design-icons/Qrcode';

export default {
  components: { Qrcode },
  mixins: [Copy, FullScreen],
  data() {
    return {
      qrText: '',
      darknet:
        '2868e12f320073cad0c2959c42559fbcfd1aa326fcb943492ed7f02c9820aa399@jbx2afvrkuxopekkvipjcult26ffvu3t4lq5x7k4zcs3z7hovu4kdtyd.onion:9735',
      clearnet:
        '02868e12f320073cad0c2959c42559fbcfd1aa326fcb943492ed7f02c9820aa399@coinos.io:9735',
    };
  },
  methods: {
    qr(text) {
      if (text === this.qrText) this.qrText = '';
      else this.qrText = text;

      this.$nextTick(() => {
        let canvas = document.getElementById('qr');
        if (!canvas) return;
        qr.toCanvas(canvas, text, e => {
          if (e) console.log(e);
        });
      });
    },
  },
};
</script>

<style lang="stylus" scoped>
.v-application code
  max-width 100%
  word-wrap break-word
  font-size 0.8em
</style>
