<template>
    <v-form @submit.prevent="sendToUser">
      <v-text-field
        ref="username"
        class="my-4"
        label="Enter Username"
        v-model="username"
        autocapitalize="none"
        clearable
      />
      <div class="d-flex">
        <v-btn
          class="flex-grow-1 ml-auto wide"
          @click="sendToUser"
        >
          <v-icon left color="primary">$search</v-icon>
          Find User
        </v-btn>
      </div>
    </v-form>
    </template>

<script>
import { get, call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';

export default {
  data() {
    return {
      username: '',
    };
  },
  computed: {
    payment: sync('payment'),
  },
  methods: {
    getRecipient: call('getRecipient'),
    sendToUser() {
      this.getRecipient(this.username);
      this.$emit('edit');
    },
  },
  mounted() {
    this.$refs.username.focus();
  },
};
</script>
