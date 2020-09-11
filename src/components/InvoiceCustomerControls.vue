<template>
  <div>
    <v-btn @click="$emit('cancel')" class="mr-1 mb-1 mb-sm-0 wide">
      <v-icon left color="pink">$cancel</v-icon>
      Cancel
    </v-btn>
    <v-btn
      v-if="invoice.amount > 0"
      @click.native="$emit('tipping')"
      class="mr-2 mb-2 mb-sm-0 wide"
    >
      <template v-if="invoice.tip">
        <v-icon color="primary" left>$edit</v-icon><span>Edit Tip</span>
      </template>
      <template v-else>
        <v-icon color="primary" left>$add</v-icon><span>Add Tip</span>
      </template>
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
