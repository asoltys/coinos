<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <template v-else>
      <v-layout>
        <v-flex class="mr-2" md6>
          <template v-if="buys.length">
            <v-list subheader>
              <template v-for="(order, i) in buys">
                <v-list-tile @click="5" :key="i">
                  <v-list-tile-content>
                    <v-layout>
                      <v-list-tile-action-text>{{
                        order.date | format
                      }}</v-list-tile-action-text>
                      <v-list-tile-sub-title
                        >{{
                          order.amount * order.price
                        }}
                        CAD</v-list-tile-sub-title
                      >
                      <v-list-tile-title class="received text-right ml-auto"
                        >{{ order.amount }} BTC at
                        {{ order.price }}</v-list-tile-title
                      >
                    </v-layout>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
            </v-list>
          </template>
        </v-flex>
        <v-flex md6>
          <template v-if="sells.length">
            <v-list subheader>
              <template v-for="(order, i) in sells">
                <v-list-tile @click="5" :key="i">
                  <v-list-tile-action-text>{{
                    order.date | format
                  }}</v-list-tile-action-text>
                  <v-list-tile-content class="sent">
                    <v-list-tile-title
                      >{{ order.price }} for
                      {{ order.amount }} BTC</v-list-tile-title
                    >
                    <v-list-tile-sub-title
                      ><span
                        >{{ order.amount * order.price }} CAD</span
                      ></v-list-tile-sub-title
                    >
                  </v-list-tile-content>
                </v-list-tile>
              </template>
            </v-list>
          </template>
          <v-alert class="black--text" value="true" v-else color="yellow"
            >No payments found in the given time period</v-alert
          >
        </v-flex>
      </v-layout>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { format } from 'date-fns';

export default {
  filters: {
    format: d => format(d, 'YYYY-MM-DD HH:mm'),
  },

  data() {
    return {
      currency: 'CAD',
      buys: [
        {
          date: Date.now(),
          amount: 1.5,
          price: 4000,
        },
        {
          date: Date.now(),
          amount: 1,
          price: 3800,
        },
        {
          date: Date.now(),
          amount: 6,
          price: 3500,
        },
      ],
      sells: [
        {
          date: Date.now(),
          amount: 2,
          price: 5000,
        },
        {
          date: Date.now(),
          amount: 1,
          price: 5500,
        },
        {
          date: Date.now(),
          amount: 3,
          price: 5600,
        },
        {
          date: Date.now(),
          amount: 2,
          price: 5800,
        },
        {
          date: Date.now(),
          amount: 1,
          price: 5900,
        },
        {
          date: Date.now(),
          amount: 2,
          price: 7000,
        },
      ],
    };
  },

  computed: {
    ...mapGetters(['loading', 'rate']),
  },

  mounted() {},
};
</script>

<style lang="stylus" scoped>
.sent
  color rgb(255, 185, 85) !important

.received
 color rgb(180, 255, 0) !important

.fullwidth
  width 100%

.date-picker .v-btn
  width 100%
</style>
