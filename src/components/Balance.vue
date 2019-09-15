<template>
  <v-layout>
    <v-flex class="text-center mb-2">
      <span class="display-2">{{ user.balance }} </span>
      <span class="headline">SAT</span>
      <h3>
        {{ ((user.balance / 100000000) * rate).toFixed(2) }} CAD @
        <span class="yellow--text">{{ rate }}</span> per BTC
      </h3>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  props: { payobj: { type: Object } },
  computed: mapGetters(['rate', 'user']),
};
</script>
