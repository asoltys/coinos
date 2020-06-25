<template>
  <div>
    <video v-show="false" ref="video" />
    <div class="d-flex justify-center">
      <v-progress-linear v-if="loading" indeterminate />
      <canvas class="flex-grow-1" v-else ref="canvas" />
    </div>
    <div class="d-flex">
      <v-btn @click="cancel" class="mr-2 my-2 flex-grow-1">
        <v-icon class="mr-1" color="red">cancel</v-icon>
        Cancel
      </v-btn>
    </div>
  </div>
</template>

<script>
import jsQR from 'jsqr';
import { get, call } from 'vuex-pathify';

export default {
  data() {
    return {
      loading: false,
    };
  },

  computed: {
    stopScanning: get('stopScanning'),
  }, 

  methods: {
    cancel() {
      this.stop();
      this.$router.go(-1);
    },
    stop() {
      if (this.$refs.video.srcObject)
        this.$refs.video.srcObject.getTracks().map(t => t.stop());
    },
    handleScan: call('handleScan'),

    tick() {
      let { video } = this.$refs;
      if (!video) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        this.loading = false;

        this.$nextTick(() => {
          var canvasElement = this.$refs.canvas;
          var canvas = canvasElement.getContext('2d');

          canvasElement.height = video.videoHeight;
          canvasElement.width = video.videoWidth;

          canvas.drawImage(
            video,
            0,
            0,
            canvasElement.width,
            canvasElement.height
          );
          var imageData = canvas.getImageData(
            0,
            0,
            canvasElement.width,
            canvasElement.height
          );

          var code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            this.handleScan(code.data);
            this.stop();
          } 
        });
      }

      requestAnimationFrame(this.tick);
    },
  },

  watch: {
    stopScanning() {
      this.stop();
    },
  },

  mounted() {
    this.loading = true;
    let { tick } = this;
    let video = this.$refs.video;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then(function(stream) {
        video.srcObject = stream;
        video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
        video.play();
        requestAnimationFrame(tick);
      });
  },

  beforeDestroy() {
    this.stop();
  } 
};
</script>
