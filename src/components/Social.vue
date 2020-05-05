<template>
  <div class="d-flex flex-wrap mb-2">
    <v-btn
      color="#59316B"
      class="flex-grow-1 mr-2 mb-2 wide"
      @click="
        go(
          'http://uzmim34vid5dkyzjxpel6zbkfz4qeqaaqe3gqrtbmekhxqglvzau73ad.onion/'
        )
      "
    >
      <tor class="mr-1" /> Tor Hidden Service
    </v-btn>
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
      @click="go('https://t.me/coinos')"
    >
      <telegram class="mr-1" /> Telegram
    </v-btn>
    <v-btn
      class="flex-grow-1 wide"
      color="#7289da"
      @click="
        go(
          'https://discordapp.com/channels/588141505181515796/588141505181515799'
        )
      "
      ><discord class="mr-1" /> Discord</v-btn
    >
  </div>
</template>

<script>
import Discord from 'vue-material-design-icons/Discord';
import Telegram from 'vue-material-design-icons/Telegram';
import Tor from 'vue-material-design-icons/Tor';
import Twitter from 'vue-material-design-icons/Twitter';

export default {
  components: { Discord, Telegram, Tor, Twitter },
  methods: {
    go(url) {
      window.location.href = url;
    },
  } 
};
</script>
