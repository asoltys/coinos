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
        <div class="text-center my-4">
          <code class="black--text" :data-clipboard-text="node">{{
            node
          }}</code>
        </div>
        <v-btn @click="() => copy(node)" class="d-block mx-auto">
          <v-icon class="mr-1">content_copy</v-icon><span>Copy</span>
        </v-btn>
      </v-card-text>
    </v-card>
    <v-card class="mt-2">
      <v-card-title>Privacy Policy</v-card-title>
      <v-card-text class="white--text body-1">
        We don't require any personal information. If you login with Facebook,
        we access your friends list in order to populate your address book.
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import qr from 'qrcode';
import { mapActions } from 'vuex';
import Copy from '../mixins/Copy';

const node =
  '02868e12f320073cad0c2959c42559fbcfd1aa326fcb943492ed7f02c9820aa399@coinos.io:9735';

export default {
  mixins: [Copy],
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
  },
};
</script>

<style lang="stylus" scoped>
.v-application code
  max-width 100%
  word-wrap break-word
  font-size 0.8em
</style>
