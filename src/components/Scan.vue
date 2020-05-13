<template>
  <div>
    HI
    <div class="d-flex justify-center">
      <v-progress-linear v-if="loading" indeterminate />
      <qrcode-stream class="mt-4" @decode="handleScan" />
    </div>
    <div class="d-flex">
      <v-btn @click="stop" class="mr-2 my-2 flex-grow-1">
        <v-icon class="mr-1" color="red">cancel</v-icon>
        Cancel
      </v-btn>
    </div>
  </div>
</template>

<script>
import { call } from 'vuex-pathify';
import { QrcodeStream } from 'vue-qrcode-reader';

export default {
  data() {
    return {
      loading: false,
    } 
  },
  components: { QrcodeStream },
  methods: {
    handleScan: call('handleScan'),
    stop() {
      this.$router.go(-1);
    } 
  } 
};
</script>
