<template>
  <v-card class="mb-2">
    <v-card-title><flash fillColor="yellow" class="mr-1 pt-3" />Lightning Node</v-card-title>
    <v-card-text>
      <qr :text="text" />
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
            <v-btn icon @click="toggle(clearnet)" class="ml-1" text>
              <qrcode />
            </v-btn>
            <v-btn icon @click="copy(clearnet)" class="ml-1" text>
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
            <v-btn icon @click="toggle(darknet)" class="ml-1" text>
              <qrcode />
            </v-btn>
            <v-btn icon @click="copy(darknet)" class="ml-1" text>
              <v-icon>content_copy</v-icon>
            </v-btn>
          </template>
        </v-textarea>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import Copy from '../mixins/Copy';
import Qrcode from 'vue-material-design-icons/Qrcode';
import Flash from 'vue-material-design-icons/Flash';
import Qr from './Qr';

export default {
  components: { Flash, Qrcode, Qr },
  mixins: [Copy],
  data() {
    return {
      text: '',
      darknet:
        '2868e12f320073cad0c2959c42559fbcfd1aa326fcb943492ed7f02c9820aa399@jbx2afvrkuxopekkvipjcult26ffvu3t4lq5x7k4zcs3z7hovu4kdtyd.onion:9735',
      clearnet:
        '02868e12f320073cad0c2959c42559fbcfd1aa326fcb943492ed7f02c9820aa399@coinos.io:9735',
    };
  },
  methods: {
    toggle(text) {
      this.text = text === this.text ? '' : text;
    },
  } 
};
</script>

<style lang="stylus" scoped>
.v-application code
  max-width 100%
  word-wrap break-word
  font-size 0.8em
</style>
