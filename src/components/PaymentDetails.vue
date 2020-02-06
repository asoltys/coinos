<template>
  <v-card class="elevation-1 my-2 pa-4" v-if="payobj">
    <div class="text-center font-weight-bold">Pay</div>
    <div class="d-flex justify-center">
      <div class="mr-2">
        <span class="display-1">{{ payobj.satoshis }}</span> SAT
      </div>
      <div>
        <span class="yellow--text">
          <span class="display-1">{{ fiat }}</span>
          {{ user.currency }}
        </span>
      </div>
    </div>
    <div class="text-center font-weight-bold">to</div>
    <div class="code my-2 text-center">
      {{ payobj.payeeNodeKey }}
    </div>
  </v-card>
</template>

<script>
import date from 'date-fns';
import { mapGetters } from 'vuex';
export default {
  props: {
    payobj: { type: Object },
  },

  filters: {
    format: d => date.format(d, 'MMMM D, YYYY @ HH:mm'),
  },

  computed: {
    ...mapGetters(['rate', 'user']),
    fiat() {
      return ((this.payobj.satoshis * this.rate) / 100000000).toFixed(2);
    },
  },
};
</script>

<style lang="stylus" scoped>
.code
  margin auto
  background #333
  word-wrap break-word
  padding 15px
  font-weight bold
</style>
