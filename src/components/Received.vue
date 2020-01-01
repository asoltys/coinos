<template>
  <div>
    <balance />
    <v-card>
      <v-alert
        v-if="user.pending"
        class="headline text-center black--text"
        color="orange lighten-2"
      >
        Unconfirmed Payment Detected!
      </v-alert>
      <v-alert v-else class="headline text-center black--text" color="yellow">
        Payment Received!
      </v-alert>
      <div class="d-flex justify-center">
        <div class="mr-2">
          <span class="display-1">{{ received }}</span> SAT
        </div>
        <div>
          <span class="yellow--text">
            <span class="display-1">{{ fiat }}</span>
            {{ user.currency }}
          </span>
        </div>
      </div>
      <v-card-actions>
        <v-btn @click="$emit('clear')">
          <v-icon>arrow_back</v-icon><span>Go Back</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import Balance from './Balance';

export default {
  components: { Balance },

  props: {
    user: { type: Object },
    received: { type: Number },
    rate: { type: Number },
  },

  computed: {
    fiat() {
      return ((this.received / 100000000) * this.rate).toFixed(2);
    },
  },
};
</script>
