<template>
  <v-snackbar class="snack" v-model="snack" :timeout="5000" top color="yellow" absolute>
    <v-icon color="black" left>$info</v-icon>
    <b v-if="message" class="black--text">{{ message }}</b>
  </v-snackbar>
</template>

<script>

export default {
  computed: {
    message: {
      get() {
        return this.$store.getters.snack;
      },
      set(v) {
        this.$store.commit('snack', v);
      },
    },
    snack: {
      get() {
        return this.message;
      },
      set(v) {
        if (!v) this.message = v;
      },
    },
  },
};
</script>
