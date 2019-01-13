<template lang="pug">
v-snackbar.yellow--text(v-model="snack" :timeout="2000" top)
  info-icon.mr-1
  span {{message}}
</template>

<script>
import InfoIcon from 'vue-material-design-icons/Information'

export default {
  components: { InfoIcon },
  computed: {
    message: {
      get () { return this.$store.getters.snack },
      set (v) { this.$store.commit('snack', v) },
    },
    snack: {
      get () { return this.message },
      set (v) { if (!v) this.message = v },
    },
  },
} 
</script>
