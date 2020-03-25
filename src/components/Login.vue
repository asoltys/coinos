<template>
  <v-container v-if="!initializing">
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
          <h2>Send and receive <a href="https://bitcoin.org/" class="yellow--text">bitcoin</a></h2>
          <p style="display: inline-flex" class="mb-0">
            with <water fillColor="#06ddff" :size="24" class="" />
            <a href="https://blockstream.com/liquid/" style="color: #06ddff"
              >Liquid</a
            >
            <span class="ml-1">and</span>
            <flash fillColor="yellow" :size="24" />
            <a href="http://lightning.network/">Lightning</a>
          </p>
        </div>
        <v-divider class="mb-2 mt-0" />
        <div class="text-center my-2 d-flex flex-wrap justify-center">
          <v-btn @click="createUser" class="my-2 my-sm-0 mr-0 mr-sm-2 wide">Create New Account</v-btn>
          <v-btn color="#4267b2" class="mb-2 mb-sm-0 wide">
            <fb-signin-button
              :params="fbSignInParams"
              @success="onSignInSuccess"
              @error="onSignInError"
              >Sign in with Facebook</fb-signin-button
            >
          </v-btn>
        </div>
        <v-divider class="mb-2" />
        <v-card>
          <v-card-text>
            <v-form @submit.prevent="submit" class="mt-4">
              <v-text-field
                label="Username"
                v-model="form.username"
                dark
                autocapitalize="none"
              />
              <v-text-field
                label="Password"
                v-model="form.password"
                type="password"
              />

              <v-btn class="mr-2 mb-2 wide" type="submit">Sign in</v-btn>
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
import { sync } from 'vuex-pathify';

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

  computed: {
    twofa: sync('twofa'),
    ...mapGetters(['error', 'user', 'initializing']),
  }, 

  methods: {
    ...mapActions(['login', 'facebookLogin', 'createUser']),

    onSignInSuccess(res) {
      this.facebookLogin(res);
    },

    onSignInError(error) {
      console.log('Facebook login failed', error);
    },

    submit(e) {
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
</style>
