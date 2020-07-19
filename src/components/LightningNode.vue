<template>
  <v-card class="mb-2">
    <v-card-title
      ><flash fillColor="yellow" class="mr-1 pt-3" />Lightning
      Node</v-card-title
    >
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
        <lnurl :lnurl="channelRequest" />
      </div>
      <div v-if="generating">
        <v-form @submit.prevent="generate">
        <v-text-field label="Local Amount" v-model="localAmt" class="body-2" ref="localAmt" />
        <v-text-field v-if="pushAmt" label="Push Amount" v-model="pushAmt" class="body-2" />
        <v-btn class="black--text mx-auto" color="primary" type="submit">
          <v-icon left>send</v-icon>
          Submit</v-btn
        >
        </v-form>
      </div>
      <div v-else-if="!channelRequest" class="d-flex">
        <v-btn class="black--text mx-auto" color="primary" @click="startGenerating">
          <v-icon left>link</v-icon>
          Request Inbound Channel</v-btn
        >
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Qrcode from 'vue-material-design-icons/Qrcode';
import Flash from 'vue-material-design-icons/Flash';
import Qr from './Qr';
import Lnurl from './Lnurl';

export default {
  components: { Flash, Qrcode, Qr, Lnurl },
  mixins: [Copy],
  data() {
    return {
      generating: false,
      localAmt: 100000,
      pushAmt: 0,
      text: '',
      darknet:
        '02868e12f320073cad0c2959c42559fbcfd1aa326fcb943492ed7f02c9820aa399@jbx2afvrkuxopekkvipjcult26ffvu3t4lq5x7k4zcs3z7hovu4kdtyd.onion:9735',
      clearnet:
        '02868e12f320073cad0c2959c42559fbcfd1aa326fcb943492ed7f02c9820aa399@coinos.io:9735',
    };
  },
  computed: {
    channelRequest: sync('channelRequest'),
  },
  methods: {
    startGenerating() {
      this.generating = true;
      this.$nextTick(() => {
        this.$refs.localAmt.focus();
      });
    },
    generate() {
      this.generateChannelRequest(this.$data);
      this.generating = false;
    },
    generateChannelRequest: call('generateChannelRequest'),
    toggle(text) {
      this.text = text === this.text ? '' : text;
    },
  },

  mounted() {
    this.channelRequest = null;
  },
};
</script>

<style lang="stylus" scoped>
.v-application code
  max-width 100%
  word-wrap break-word
  font-size 0.8em
</style>
