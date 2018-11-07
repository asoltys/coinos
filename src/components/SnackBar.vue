<template lang="pug">
v-snackbar.yellow--text(v-model="snack" :timeout="2000" top)
  info-icon
  span {{message}}
</template>

<script>
export default {
  computed: {
    message: {
      get () { return this.$store.getters.snack },
      set (v) { this.$store.commit('SET_SNACK', v) },
    },
    snack: {
      get () { return this.message },
      set (v) { if (!v) this.message = v },
    },
  },
} 
</script>
