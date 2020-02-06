<template>
  <v-container v-if="!initializing">
    <v-alert
      class="black--text mb-4"
      color="yellow"
      icon="info"
      v-model="showlogout"
      value="showlogout"
      dismissible
      transition="scale-transition"
      >You've logged out
    </v-alert>
    <h2>Forgot Your Password?</h2>
    <p>
      Enter your email and we'll send you a reset link.
    </p>
    <v-card>
      <v-card-text>
        <v-form @submit="submit()" class="mt-4">
          <v-text-field
            label="Email"
            v-model="email"
            autofocus
            autocapitalize="none"
          />

          <v-btn class="mr-2 mb-2" type="submit">Submit</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  data() {
    return {
      email: '',
      submitted: false,
    };
  },

  computed: mapGetters(['error', 'user']),
  methods: {
    ...mapActions(['forgot']),
    submit() {
      this.submitted = true;
      this.forgot(this.email);
    },
  },
};
</script>

<style lang="stylus" scoped>
@media (max-width: 600px)
  .v-btn
    width 100%
    height 70px !important
</style>
