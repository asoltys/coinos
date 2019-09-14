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
        <v-card class="code text-center mb-4" :data-clipboard-text="node">
          <h3 class="mb-4">Lightning Node Info</h3>
          <canvas id="qr" class="d-block mx-auto mb-4" />
          <v-chip class="body-2 font-weight-black d-block mb-4">{{
            node
          }}</v-chip>
          <v-btn @click="copy" class="d-block mx-auto">
            <v-icon class="mr-1">content_copy</v-icon><span>Copy</span>
          </v-btn>
        </v-card>
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
code
  max-width 400 !important
  word-wrap break-word

.code
  margin auto
  background #333
  padding 10px
</style>
