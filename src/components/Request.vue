<template>
  <div class="d-flex">
    <h2 class="text-center">Send {{ total }} Satoshis</h2>
    <v-card class="pa-3 text-center">
      <div class="code" v-if="showcode">{{ copytext }}</div>
      <canvas
        id="qr"
        v-show="!showcode"
        width="100"
        height="100"
        @click="fullscreen"
        class="w-100"
      />
      <v-btn @click.native="showcode = !showcode">
        <v-icon>code</v-icon><span>{{ code }}</span>
      </v-btn>
      <v-btn @click.native="copy">
        <v-icon>content_copy</v-icon><span>Copy</span>
      </v-btn>
    </v-card>
    <v-btn @click="clear">
      <v-icon>arrow_back</v-icon><span>Go Back</span>
    </v-btn>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
export default {
  props: {
    copytext: {
      type: String,
    },
    clear: {
      type: Function,
    },
    total: {
      type: Number,
    },
  },

  data() {
    return {
      full: false,
      showcode: false,
    };
  },

  computed: {
    code() {
      return this.showcode ? 'Show QR' : 'Show Code';
    },
  },

  methods: {
    ...mapActions(['snack']),
    fullscreen() {
      if (this.full) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        this.full = false;
        return;
      }

      let elem = document.getElementById('qr');

      if (elem.requestFullscreen) {
        elem.requestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }

      this.full = true;
    },

    copy() {
      var textArea = document.createElement('textarea');
      textArea.style.position = 'fixed';
      textArea.value = this.copytext;

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
.code
  margin auto
  width 260px
  height 260px
  background #333
  word-wrap break-word
  padding 15px
</style>
