<template>
  <v-dialog v-model="dialog" width="500" @click:outside="close">
    <v-card>
      <v-card-title class="headline" primary-title>
        Password
      </v-card-title>

      <v-card-text>
        <v-text-field type="password" v-model="password" />
      </v-card-text>
      <v-card-actions>
        <v-btn color="red" text @click="close">
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="submit">
          Ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      password: '',
    };
  },

  methods: {
    close() {
      this.$nextTick(() => (this.dialog = false));
    },
    submit() {
    } 
  },
};
</script>
