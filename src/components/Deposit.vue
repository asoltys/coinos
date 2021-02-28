<template>
  <v-dialog v-model="deposit" width="500" @click:outside="close">
    <v-card>
      <v-card-title class="headline" primary-title>
        Deposit Funds
      </v-card-title>

      <receive />

      <v-card-actions>
        <v-btn text @click="close">
          <v-icon left color="red">$cancel</v-icon>
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="close" color="primary" text>
          Ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Receive from './Receive.vue';
import { sync } from 'vuex-pathify';

export default {
  components: { Receive },
  computed: {
    deposit: sync('deposit'),
    fullscreen: sync('fullscreen'),
  },
  methods: {
    close() { this.deposit = false; this.fullscreen = false; },
  } 
};
</script>
