<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
      <div v-else>
    <v-textarea label="Base64 Encoded Acceptance Transaction" v-model="text" />
      <v-btn @click="accept({ id, text })">Accept</v-btn>
      </div>
  </div>
</template>

<script>
import { call, get } from 'vuex-pathify';

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
  computed: {
    loading: get('loading'),
  },
  methods: {
    accept: call('accept'),
  },
};
</script>
