<template>
  <v-container v-if="!initializing">
    <v-dialog :value="loggingIn && !error" max-width="350">
      <v-card>
        <v-card-title class="subheading">Approval Required</v-card-title>
        <v-card-text>
          <v-layout>
            <img class="mr-2 logo" src="../assets/authy.png" />
            <span>
              Use the Authy app on your phone to approve the login request
            </span>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-layout>
      <v-flex>
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
        <v-form @submit="submit">
          <v-text-field
            label="Username"
            v-model="form.username"
            autofocus
            dark
            autocapitalize="none"
          />
          <v-text-field
            label="Password"
            v-model="form.password"
            type="password"
          />
          <v-btn class="mr-2 mb-2" type="submit">Sign in</v-btn>
          <v-btn class="mr-2 mb-2" @click="$router.push('/register')"
            >Register</v-btn
          >
          <v-btn
            class="mr-2 mb-2"
            v-if="native()"
            color="#4267b2"
            @click="facebookConnect"
          >
            Facebook Login
          </v-btn>
          <v-btn v-else color="#4267b2" class="mb-2">
            <fb-signin-button
              :params="fbSignInParams"
              @success="onSignInSuccess"
              @error="onSignInError"
              >Facebook Login</fb-signin-button
            >
          </v-btn>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  props: {
    logout: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      fbSignInParams: {
        scope: 'email,user_friends',
        return_scopes: true,
      },
      loggingIn: false,
      form: {
        username: '',
        password: '',
      },
      showlogout: false,
    };
  },

  computed: mapGetters(['error', 'user', 'initializing']),

  methods: {
    ...mapActions(['login', 'facebookLogin']),

    download() {
      window.location =
        'https://play.google.com/store/apps/details?id=io.cordova.coinos';
    },

    onSignInSuccess(res) {
      if (res.status === 'connected') {
        let i = setInterval(() => {
          this.loggingIn = true;
          clearInterval(i);
        }, 3000);
        let j = setInterval(() => {
          this.loggingIn = false;
          clearInterval(j);
        }, 60000);
      }
      this.facebookLogin(res);
    },

    onSignInError(error) {
      console.log('Facebook login failed', error);
    },

    facebookConnect() {
      window.facebookConnectPlugin.login(
        this.fbSignInParams.scope.split(','),
        this.onSignInSuccess,
        this.onSignInError
      );
    },

    native() {
      return window.location.protocol === 'file:';
    },

    submit(e) {
      e.preventDefault();
      let i = setInterval(() => {
        this.loggingIn = true;
        clearInterval(i);
      }, 3000);
      let j = setInterval(() => {
        this.loggingIn = false;
        clearInterval(j);
      }, 60000);
      this.login(this.form);
      this.showlogout = false;
    },
  },

  created() {
    if (this.logout) {
      this.$store.dispatch('logout');
    }
  },

  mounted() {
    this.showlogout = this.logout;
  },
};
</script>

<style lang="stylus" scoped>
.v-text-field
  font-size 18px

.fb-signin-button
  display: inline-block;
  padding: 4px 8px;
  border-radius: 3px;
</style>
