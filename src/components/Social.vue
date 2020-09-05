<template>
  <div class="d-flex flex-wrap mb-2">
    <v-btn
      color="#1DA1F2"
      class="flex-grow-1 mr-2 mb-2 wide"
      @click="go('https://twitter.com/coinoswallet')"
    >
      <twitter class="mr-1" /> Twitter
    </v-btn>
    <v-btn
      color="#179cde"
      class="flex-grow-1 mr-2 mb-2 wide"
      @click="go('https://t.me/coinoswallet')"
    >
      <telegram class="mr-1" /> Telegram
    </v-btn>
  </div>
</template>

<script>
import Telegram from 'vue-material-design-icons/Telegram';
import Twitter from 'vue-material-design-icons/Twitter';

export default {
  components: { Telegram, Twitter },
  methods: {
    go(url) {
      window.location.href = url;
    },
  } 
};
</script>
