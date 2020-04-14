<template>
  <div>
    <v-expansion-panels accordion>
      <v-expansion-panel v-for="a in user.accounts" :key="a.asset">
        <v-expansion-panel-header
          ripple
          class="justify-center justify-space-around flex-wrap"
          expand-icon=""
        >
          <div>
            {{ a.asset }}
          </div>
          <div class="display-1">
            {{ a.balance }}
          </div>
          <div v-if="a.pending" class="display-1 red--text">
            {{ a.pending }} unconfirmed
          </div>
        </v-expansion-panel-header>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';

export default {
  computed: {
    assets() {
      return this.user.accounts.map(a => a.asset);
    },
    user: get('user'),
  },
};
</script>
