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
        <div class="text-center">
          <h2>Send and receive <span class="yellow--text">bitcoin</span></h2>
          <p style="display: inline-flex" class="mb-0">
            with <water fillColor="#06ddff" :size="24" class="" />
            <a href="https://blockstream.com/liquid/" style="color: #06ddff"
              >Liquid</a
            >&nbsp; and <flash fillColor="yellow" :size="24" />
            <a href="http://lightning.network/">Lightning</a>!
          </p>
        </div>
        <v-divider class="mb-2 mt-0" />
        <div class="text-center my-2 d-flex flex-wrap justify-center">
          <v-btn
            v-if="native()"
            color="#4267b2"
            @click="facebookConnect"
            class="mb-2 mr-2"
          >
            Sign in with Facebook
          </v-btn>
          <v-btn v-else color="#4267b2" class="my-2 my-sm-0 mr-sm-2">
            <fb-signin-button
              :params="fbSignInParams"
              @success="onSignInSuccess"
              @error="onSignInError"
              >Sign in with Facebook</fb-signin-button
            >
          </v-btn>
          <v-btn @click="createUser" class="mb-2 mb-sm-0">Create Account</v-btn>
        </div>
        <v-divider class="mb-2" />
        <v-card>
          <v-card-text>
            <v-form @submit="submit" class="mt-4">
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
              <v-btn class="mr-2 mb-2" type="submit">Forgot password</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Flash from 'vue-material-design-icons/Flash';
import Water from 'vue-material-design-icons/Water';

export default {
  components: { Flash, Water },

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
    ...mapActions(['login', 'facebookLogin', 'createUser']),

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
a
  text-decoration none

.v-text-field
  font-size 18px

.fb-signin-button
  padding: 4px 8px;
  border-radius: 3px;

@media (max-width: 600px)
  .v-btn
    width 100%
</style>
