<template>
    <v-card class="mb-2">
      <v-card-title>Stats</v-card-title>
      <v-progress-linear v-if="loading" indeterminate />
      <v-card-text v-else>
        <pre>{{ stats }}</pre>
      </v-card-text>
    </v-card>
</template>

<script>
import { get, call } from 'vuex-pathify';

export default {
  computed: {
    stats: get('stats'),
  },
  methods: {
    fetch: call('getStats'),
  },
  mounted() {
    this.fetch();
  },
};
</script>
