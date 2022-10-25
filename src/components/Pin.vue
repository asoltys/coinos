<template>
  <v-dialog v-model="promptPin" width="500" @click:outside="close">
    <v-form @submit.prevent="submit">
      <v-card>
        <v-card-title class="headline" primary-title>
          Enter PIN
        </v-card-title>

        <v-card-text>
        <v-alert
          class="mb-2"
          v-if="error"
          color="error"
          transition="scale-transition"
        >
          Try again
        </v-alert>
          <pincode-input
            class="mx-auto primary--text"
            v-model="pin"
            placeholder="0"
            :length="6"
            :key="promptPin"
          />
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
import { get, call, sync } from 'vuex-pathify';
import PincodeInput from 'vue-pincode-input';

export default {
  components: { PincodeInput },
  data() {
    return {
      error: null,
    };
  },

  computed: {
    pin: sync('pin'),
    user: get('user'),
    promptPin: sync('promptPin'),
  },

  methods: {
    close() {
      this.$nextTick(() => (this.promptPin = false));
    },
    async submit() {
      if (this.pin === this.user.pin) this.close();
      else this.error = true;
    },
  },
  watch: {
    promptPin() {
      this.error = null;
    } 
  } 
};
</script>

<style lang="stylus">
.vue-pincode-input
  color #ffeb3b
</style>
