<template>
  <div>
    <v-btn
      v-if="invoice.amount > 0"
      @click.native="$emit('tipping')"
      class="flex-grow-1"
    >
      <template v-if="invoice.tip">
        <v-icon color="primary" left>$edit</v-icon><span>Edit Tip</span>
      </template>
      <template v-else>
        <v-icon color="primary" left>$add</v-icon><span>Add Tip</span>
      </template>
    </v-btn>
    <v-btn @click="$emit('cancel')" class="flex-grow-1">
      <v-icon left color="pink">$cancel</v-icon>
      Cancel
    </v-btn>
  </div>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';

export default {
  computed: {
    invoice: sync('invoice'),
  },
};
</script>
