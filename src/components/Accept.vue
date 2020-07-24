<template>
  <div>
    <v-textarea label="Base64 Encoded Acceptance Transaction" v-model="text" />
      <v-btn @click="accept({ id, text })">Accept</v-btn>
  </div>
</template>

<script>
import { call } from 'vuex-pathify';

export default {
  props: {
    id: {
      type: Number,
      default: null,
      required: true,
    },
  },
  data() {
    return {
      text: null,
    };
  },
  methods: {
    accept: call('accept'),
  },
};
</script>
