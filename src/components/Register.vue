<template>
  <v-layout>
    <v-flex xs12>
      <v-form @submit="submit">
        <v-text-field
          label="Username"
          v-model="form.username"
          autofocus
        ></v-text-field>
        <v-text-field
          label="Password"
          v-model="form.password"
          type="password"
        ></v-text-field>
        <v-text-field
          label="Confirm Password"
          v-model="form.passconfirm"
          type="password"
        ></v-text-field>
        <v-btn type="submit">Register</v-btn>
      </v-form>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        passconfirm: '',
        unit: 'BTC',
        commission: '',
        pubkey: '',
        privkey: '',
        address: '',
      },
    };
  },

  methods: {
    submit(e) {
      e.preventDefault();
      this.createUser(this.form);
    },

    ...mapActions(['createUser']),
  },
};
</script>
