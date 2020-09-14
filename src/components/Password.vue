<template>
  <v-dialog v-model="promptPassword" width="500" @click:outside="close">
    <v-form @submit.prevent="submit">
      <v-card>
        <v-card-title class="headline" primary-title>
          Password
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
          <v-text-field
            type="password"
            v-model="password"
            ref="password"
            autofocus
            :error="error"
            @input="error = false"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" text @click="close">
            Cancel
          </v-btn>
          <!--
          <v-btn text @click="lnurl">
            <v-icon left>$qrcode</v-icon> Lnurl Auth
          </v-btn>
          -->
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
  data() {
    return {
      error: null,
      password: '',
    };
  },

  computed: {
    promptPassword: sync('promptPassword'),
  },

  methods: {
    checkPassword: call('checkPassword'),
    close() {
      this.$nextTick(() => (this.promptPassword = false));
    },
    async submit() {
      if (await this.checkPassword(this.password)) this.close();
      else this.error = true;
    },
  },

  watch: {
    promptPassword(v) {
      if (v) this.$nextTick(() => this.$refs.password.focus());
    },
  },
};
</script>
