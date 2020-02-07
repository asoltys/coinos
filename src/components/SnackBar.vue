<template>
  <v-snackbar class="yellow--text" v-model="snack" :timeout="5000" top>
    <info-icon class="mr-1" />
    <b>{{ message }}</b>
  </v-snackbar>
</template>

<script>
import InfoIcon from 'vue-material-design-icons/Information';

export default {
  components: { InfoIcon },
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
