<template>
  <div>
    <v-textarea label="Paste acceptance here" v-model="text" />
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
