<template>
  <div>
    <v-expansion-panels accordion>
      <v-expansion-panel v-for="a in user.accounts" :key="a.asset" @click="() => toggleAsset(a.asset)">
        <v-expansion-panel-header
          ripple
          class="d-flex justify-space-around"
          expand-icon=""
        >
                <div class="asset">
            {{ a.asset }}
          </div>
          <div class="display-1 flex-grow-1 text-right">
            {{ a.balance }}
            <div v-if="a.pending" class="title red--text">
              {{ a.pending }} unconfirmed
            </div>
          </div>
        </v-expansion-panel-header>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import { get, call } from 'vuex-pathify';

export default {
  computed: {
    user: get('user'),
  },
  methods: {
    toggleAsset: call('toggleAsset'),
  },
};
</script>
<style lang="stylus" scoped>
.asset
  max-width 70%
  word-wrap break-word
  </style>
