<template>
  <v-dialog v-model="open" width="500" @click:outside="close">
    <v-form @submit.prevent="submit">
      <v-card>
        <v-card-title class="headline" primary-title>
          Select Market
        </v-card-title>

        <v-card-text>
          <v-list>
            <v-list-item v-for="a in assets" @click="select(a)">
              {{ a.ticker }}
              {{ a.id }}
              </v-list-item>
              </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" text @click="close">
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn type="submit" color="primary" text>
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import { call, sync } from 'vuex-pathify';

export default {
  props: {
    assets: { type: Array },
  },

  data: () => ({
    open: true,
  }),

  methods: {
    close() {
      this.$nextTick(() => (this.open = false));
    },
    select(a) {
      this.$emit('input', a.id);
    } 
  },
};
</script>
