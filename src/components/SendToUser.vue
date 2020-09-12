<template>
    <v-form @submit.prevent="sendToUser">
      <v-text-field
        ref="username"
        class="my-4"
        label="Enter Username"
        v-model="username"
        autocapitalize="none"
        clearable
      >
      <template v-slot:append>
        <v-btn
          class="flex-grow-1 ml-auto wide toggle"
          @click="sendToUser"
        >
          <v-icon left color="primary">$search</v-icon>
          Find
        </v-btn>
      </template>
      </v-text-field>
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

<style>

</style>
