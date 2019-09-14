<template>
  <v-card>
    <v-alert class="headline" value="true" color="success">
      Payment Received!
    </v-alert>
    <v-list>
      <v-list-item>
        <v-list-item-title>Satoshis</v-list-item-title>
        <v-list-item-subtitle>{{ received }}</v-list-item-subtitle>
      </v-list-item>
      <v-list-item>
        <v-list-item-title>CAD</v-list-item-title>
        <v-list-item-subtitle>{{
          ((received / 100000000) * rate).toFixed(2)
        }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>
    <v-card-actions>
      <v-btn @click="clear">
        <v-icon>arrow_back</v-icon><span>Go Back</span>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    received: {
      type: String,
    },
    rate: {
      type: Number,
    },
  },
};
</script>
