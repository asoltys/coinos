<template>
  <v-card>
    <v-card-text class="white--text" v-if="orders.length">
      <v-container class="pb-0 text-right">
        <v-row class="hover">
          <v-col>Time</v-col>
          <v-col>Amount</v-col>
          <v-col>Price</v-col>
          <v-btn icon class="toggle" style="visibility: hidden; height: 0;">
            <v-icon color="error">$cancel</v-icon>
          </v-btn>
        </v-row>
        <v-row v-for="p in orders" :key="p.id" class="hover">
          <v-col class="my-auto mr-1">
            <span>{{ dateFormat(p.updatedAt) }}</span>
          </v-col>
          <v-col class="my-auto mr-1">
            <span v-if="p.type === 'sell'">{{ format(p.a1, p.v1) }}</span>
            <span v-else>{{ format(p.a2, p.v2) }}</span>
          </v-col>
          <v-col class="my-auto">
            {{ parseFloat(p.rate.toFixed(2)) }}
            </v-col>
          <v-btn
            v-if="p.user_id === user.id"
            @click.stop="deleteOrder(p.id)"
            class="my-auto toggle"
            icon
          >
            <v-icon color="error">$cancel</v-icon>
          </v-btn>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-text class="white--text" v-else>
      <h2 class="mb-2 text-center">No Open Orders</h2>
      </v-card-text>
  </v-card>
</template>

<script>
import { get, sync, call } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import { format, parseISO } from 'date-fns';

export default {
  props: {
    orders: {
      type: Array,
      default: () => [],
    },
  },
  mixins: [Copy],
  computed: {
    assets: get('assets'),
    user: get('user'),
  },
  methods: {
    dateFormat(d) {
      return format(parseISO(d), 'M/d HH:mm:ss');
    },
    deleteOrder: call('deleteOrder'),
    format(asset, value) {
      let precision = 0,
        ticker;
      let obj = this.assets[asset];
      if (obj) ({ precision, ticker } = obj);
      if (value)
        return parseFloat(this.$format(value, precision)).toFixed(precision);
      if (ticker) return ticker;
      return asset.substr(0, 3);
    },
  },
};
</script>

<style lang="stylus">
.col
  padding 0

.hover
  &:hover
    background #333
</style>
