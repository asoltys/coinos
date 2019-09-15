<template>
  <v-list class="elevation-1 ma-2" v-if="payobj">
    <v-list-item>
      <v-list-item-title>Amount</v-list-item-title>
      <v-list-item-subtitle>{{ payobj.satoshis }}</v-list-item-subtitle>
    </v-list-item>
    <v-list-item>
      <v-list-item-title>Recipient</v-list-item-title>
      <v-list-item-subtitle>{{ payobj.payeeNodeKey }}</v-list-item-subtitle>
    </v-list-item>
    <v-list-item>
      <v-list-item-title>Date</v-list-item-title>
      <v-list-item-subtitle>
        {{ payobj.timestampString | format }}
      </v-list-item-subtitle>
    </v-list-item>
  </v-list>
</template>

<script>
import date from 'date-fns';
export default {
  props: {
    payobj: { type: Object },
  },

  filters: {
    format: d => date.format(d, 'MMM D, YYYY HH:mm'),
  },
};
</script>
