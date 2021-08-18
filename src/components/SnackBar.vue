<template>
  <v-snackbar
    v-if="text"
    class="snack elevation-4"
    v-model="open"
    :timeout="timeout"
    fixed
    top
    color="white"
  >
    <template v-slot:action="{ attrs }">
      <v-btn text v-bind="attrs" icon @click="open = false">
        <v-icon color="secondary">$cancel</v-icon>
      </v-btn>
    </template>
    <div class="d-flex">
      <div class="my-auto">
        <v-icon v-if="type === 'error'" color="error" left>$alert</v-icon>
        <v-icon v-else-if="type === 'success'" color="green" left>$check</v-icon>
        <v-icon v-else color="black" left>$info</v-icon>
      </div>
      <div class="my-auto">
        <b class="black--text">{{ text }}</b>
      </div>
    </div>
  </v-snackbar>
</template>

<script>
import { get } from 'vuex-pathify';
export default {
  props: {
    timeout: {
      type: Number,
      default: null,
    },
    type: {
      type: String,
      default: 'info',
    },
    text: {
      type: String,
      default: '',
    },
  },
  data: () => ({ open: false }),
  watch: {
    open(v) {
      if (!v) this.$emit('done');
    },
    text() {
      this.open = true;
    },
  },
};
</script>

<style lang="stylus" scoped>
.snack
  max-width 100% !important
  top -50px
</style>
