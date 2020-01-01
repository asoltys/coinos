<template>
  <div>
    <v-card>
      <v-card-text class="white--text body-1">
        <p>
          This app is free to use and the source code is available on
          <a href="https://github.com/asoltys/coinos.io">Github</a> in case you
          want to host your own node, report issues, or contribute to make it
          better.
        </p>
        <h3 class="mb-4 text-center">Lightning Node Info</h3>
        <canvas id="qr" class="d-block mx-auto mb-4" />
        <div class="node px-4 py-1 mb-4 text-center caption font-weight-black" :data-clipboard-text="node">
          {{ node }}
        </div>
        <v-btn @click="copy" class="d-block mx-auto">
          <v-icon class="mr-1">content_copy</v-icon><span>Copy</span>
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import qr from 'qrcode';
import { mapActions } from 'vuex';

const node =
  '02868e12f320073cad0c2959c42559fbcfd1aa326fcb943492ed7f02c9820aa399@coinos.io:9735';

export default {
  data() {
    return { node };
  },

  mounted() {
    let canvas = document.getElementById('qr');
    if (!canvas) return;
    qr.toCanvas(canvas, node, e => {
      if (e) console.log(e);
    });
  },

  methods: {
    ...mapActions(['snack']),
    copy() {
      var textArea = document.createElement('textarea');
      textArea.style.position = 'fixed';
      textArea.value = node;

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      document.execCommand('copy');
      document.body.removeChild(textArea);

      this.snack('Copied to Clipboard');
    },
  },
};
</script>

<style lang="stylus" scoped>
.node
  word-wrap break-word
  background #212121
  overflow auto
  border-radius 50px
  width auto
</style>
