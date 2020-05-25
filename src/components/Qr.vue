<template>
  <canvas
    v-if="text"
    ref="canvas"
    class="d-block mx-auto mb-4"
    @click="fullscreen"
    />
</template>

<script>
import qr from 'qrcode';

export default {
  props: { text: { type: String, default: '' } },
  data() {
    return {
      full: false,
    };
  },
  watch: {
    text(text) {
      if (text) this.draw(text);
    },
  },
  methods: {
    draw(text) {
      this.$nextTick(() => {
        let canvas = this.$refs.canvas;
        if (!canvas) return;
        qr.toCanvas(canvas, text, e => {
          if (e) console.log(e);
        });
        canvas.style.width = '30vh';
        canvas.style.height = '30vh';
      });
    },
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

      let elem = this.$refs.canvas;

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
  },
};
</script>
