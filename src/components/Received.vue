<template>
  <v-card>
    <v-alert class="headline text-center black--text" color="yellow">
      Payment Received!
    </v-alert>
    <div class="w-100 text-center">
      <flash-icon fillColor="yellow" size="100" title="Lightning" />
    </div>
    <div class="d-flex justify-center">
      <div class="mr-2">
        <span class="display-1">{{ received }}</span> SAT
      </div>
      <div>
        <span class="yellow--text">
          <span class="display-1">{{ fiat }}</span>
          {{ currency }}
        </span>
      </div>
    </div>
    <v-card-actions>
      <v-btn @click="$emit('clear')">
        <v-icon>arrow_back</v-icon><span>Go Back</span>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import FlashIcon from 'vue-material-design-icons/Flash';

export default {
  components: { FlashIcon },

  props: {
    currency: { type: String },
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
