<template>
  <div>
    <div v-if="amount > 0">
      <h1 class="text-center font-weight-black">Requesting</h1>
      <div class="d-flex justify-center mb-2">
        <div class="mr-2">
          <span class="display-1">{{ amount }}</span> SAT
        </div>
        <div>
          <span class="yellow--text">
            <span class="display-1">{{ fiat }}</span>
            {{ user.currency }}
          </span>
        </div>
      </div>
    </div>
    <h1 v-else class="text-center font-weight-black">Receiving Address</h1>
    <v-card class="pa-3 text-center mb-2">
      <div v-if="showcode" class="code mb-4">{{ copytext }}</div>
      <canvas
        id="qr"
        v-show="!showcode"
        width="100"
        height="100"
        @click="fullscreen"
        class="w-100 mx-auto mb-2"
      />
      <div class="mb-2" v-if="!(amount > 0)">
        <code class="black--text mb-2" :data-clipboard-text="copytext">{{
          copytext
        }}</code>
      </div>
      <div>
        <v-btn
          v-if="amount > 0"
          @click.native="showcode = !showcode"
          class="mr-2"
        >
          <v-icon v-if="showcode">crop_free</v-icon>
          <v-icon v-else>code</v-icon>
          <span>{{ code }}</span>
        </v-btn>
        <v-btn @click.native="copy">
          <v-icon>content_copy</v-icon><span>Copy</span>
        </v-btn>
      </div>
    </v-card>
    <v-btn @click="$emit('clear')" class="mb-2">
      <v-icon>arrow_back</v-icon><span>Go Back</span>
    </v-btn>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
export default {
  props: {
    copytext: {
      type: String,
    },
    clear: {
      type: Function,
    },
    total: {
      type: String,
    },
  },

  data() {
    return {
      fixedRate: 0,
      full: false,
      showcode: false,
    };
  },

  computed: {
    ...mapGetters(['amount', 'rate', 'user']),
    fiat() {
      return ((this.amount * this.fixedRate) / 100000000).toFixed(2);
    },
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

  mounted() {
    this.fixedRate = this.rate;
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

.v-application code
  max-width 100%
  word-wrap break-word
  font-size 0.8em
</style>
