<template>
  <div>
    <v-progress-linear v-if="saving" indeterminate />

    <v-card class="mb-2">
      <v-card-title>Your public page</v-card-title>
      <v-card-text>
        <div class="mx-auto text-center w-full title">
          <a :href="publicPage" style="text-decoration: none">{{ publicPage }}</a>
        </div>
      </v-card-text>
    </v-card>

    <v-card class="mb-2">
      <v-card-title>Security</v-card-title>
      <v-card-text>
        <div class="d-flex flex-wrap justify-center">
          <v-btn @click="changePassword" class="mr-sm-2 mb-2">
            <v-icon left class="primary--text">$lock</v-icon>
            <span>{{ user.password ? 'Change' : 'Set' }} Password</span>
          </v-btn>
          <v-btn
            @click.stop="showPinDialog = !showPinDialog"
            class="mr-sm-2 mb-2"
          >
            <v-icon left class="primary--text">$dialpad</v-icon>
            {{ user.pin ? 'Change' : 'Set' }} PIN
          </v-btn>
          <set-pin @pin="pin" :showPinDialog="showPinDialog" />
          <v-btn @click="twofa" class="mr-sm-2 mb-2">
            <v-icon left class="primary--text">$cellphone</v-icon>
            {{ user.twofa ? 'Disable' : 'Setup' }} 2FA
          </v-btn>
        </div>

        <div v-if="set2fa">
          <v-card class="pa-3 text-center mb-2">
            <v-alert
              class="mb-4"
              color="error"
              icon="$info"
              v-model="twofaFail"
              dismissible
              transition="scale-transition"
              >Invalid token, try again</v-alert
            >
            <div v-if="user.twofa">
              <label class="font-weight-bold">Enter Code to Disable</label>

              <pincode-input
                class="mx-auto primary--text mb-2 d-block"
                v-model="token"
                :key="tokenKey"
                placeholder="0"
                :length="6"
              />
              <v-btn @click="disable2fa(token)">
                <v-icon left class="red--text">$cancel</v-icon>
                <span>Disable</span>
              </v-btn>
            </div>
            <div v-else>
              <qr :text="uri" />
              <div class="mb-2">
                <v-text-field :value="user.otpsecret" label="2fa Secret Token">
                  <template v-slot:append>
                    <v-btn
                      @click="copy(user.otpsecret)"
                      icon
                      class="ml-1"
                      title="Copy"
                    >
                      <v-icon>$copy</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
              </div>

              <label class="font-weight-bold">Enter Code to Enable</label>

              <pincode-input
                class="mx-auto primary--text mb-2 d-block"
                v-model="token"
                :key="tokenKey"
                placeholder="0"
                :length="6"
              />
            </div>
          </v-card>
        </div>
        <div v-if="changingPassword" class="mb-2">
          <v-form @keyup.native.enter="submit">
            <div id="password">
              <v-text-field
                label="New Password"
                v-model="form.password"
                type="password"
                ref="password"
              />
            </div>
            <v-text-field
              label="Confirm Password"
              v-model="form.confirm"
              type="password"
            />
            <div class="text-right">
              <v-btn @click="submit">
                <v-icon left class="primary--text">$check</v-icon>
                <span>save</span>
              </v-btn>
            </div>
          </v-form>
        </div>
      </v-card-text>
    </v-card>
    <v-card class="mb-2">
      <v-card-text>
        <v-form @keyup.native.enter="submit">
          <v-text-field
            label="Username"
            v-model="form.username"
            type="text"
            @focus="scroll"
            ref="username"
          />

          <v-autocomplete
            v-model="form.currencies"
            multiple
            chips
            deletable-chips
            :items="currencies"
            label="Currencies"
            :menu-props="{ closeOnContentClick: true, maxHeight: 200 }"
            >
          </v-autocomplete>

          <div class="text-right">
            <v-btn @click="submit">
              <v-icon left class="primary--text">$check</v-icon>
              <span>Save</span>
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
    <linking-keys />
    <div class="d-flex my-2" v-if="promptInstall">
      <v-btn class="flex-grow-1" @click="install">
        <v-icon left color="green">$home</v-icon>
        Add to Homescreen
      </v-btn>
    </div>
    <div class="d-flex my-2">
      <v-btn
        class="flex-grow-1"
        @click="startScanning"
        v-if="hasNfc && !nfcEnabled"
      >
        <v-icon color="pink" left>$nfc</v-icon>
        Enable NFC
      </v-btn>
    </div>
    <div class="d-flex my-2" v-if="promptNotifications">
      <v-btn class="flex-grow-1" @click="setupNotifications">
        <v-icon color="primary" left>$bell</v-icon>
        Enable Notifications
      </v-btn>
    </div>
  </div>
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import SetPin from './SetPin';
import qr from 'qrcode';
import Qr from './Qr';
import PincodeInput from 'vue-pincode-input';
import FullScreen from '../mixins/FullScreen';
import LinkingKeys from './LinkingKeys';
import Window from '../window';
import goTo from 'vuetify/es5/services/goto';

export default {
  components: { SetPin, PincodeInput, LinkingKeys, Qr },
  mixins: [Copy, FullScreen],
  data() {
    return {
      installed: false,
      tokenKey: 'a',
      twofaFail: false,
      token: '',
      full: false,
      saving: false,
      searchInput: '',
      showPinDialog: false,
      changingPassword: false,
      set2fa: false,
      initialized: false,
      code: '',
      dialog: false,
      form: {
        id: '',
        username: '',
        password: '',
        confirm: '',
        currency: '',
        currencies: '',
        pin: '',
        twofa: false,
      },
    };
  },

  computed: {
    publicPage() {
      return `${window.location.protocol}//${window.location.host}/${this.user.username}`
    },
    uri() {
      let { username, otpsecret } = this.user;
      return `otpauth://totp/CoinOS:${username}?secret=${otpsecret}&period=30&digits=6&algorithm=SHA1&issuer=CoinOS`;
    },
    fx: get('fx'),
    user: get('user'),
    error: sync('error'),
    success: sync('success'),
    nfcEnabled: sync('nfcEnabled'),
    noNfc: get('noNfc'),
    hasNfc() {
      return 'NDEFReader' in window && !this.noNfc;
    },
    currencies() {
      return this.fx ? Object.keys(this.fx).sort() : [];
    },
    prompt() {
      return Window.prompt;
    },

    promptInstall() {
      return this.prompt && !this.installed;
    },

    promptNotifications() {
      return (
        'Notification' in window &&
        process.env.VUE_APP_VAPID_PUBKEY &&
        Notification.permission !== 'denied' &&
        Notification.permission !== 'granted'
      );
    },
  },

  methods: {
    setupNotifications: call('setupNotifications'),
    startScanning: call('startScanning'),
    scroll(e) {
      goTo(e.target, { offset: 15 });
    },
    clear() {
      this.tokenKey += 'a';
      this.token = '';
    },
    async enable() {
      try {
        this.twofaFail = false;
        await this.enable2fa(this.token);
        this.twofa();
      } catch (e) {
        this.twofaFail = true;
      }
      this.clear();
    },
    async install() {
      const { outcome } = await this.prompt.prompt();
      if (outcome === 'accepted') this.installed = true;
    },
    filterCurrencies() {
      this.form.currencies = this.form.currencies.filter(c =>
        this.currencies.includes(c)
      );
    },
    twofa() {
      this.set2fa = !this.set2fa;
    },
    changePassword() {
      this.changingPassword = !this.changingPassword;
      if (this.changingPassword)
        this.$nextTick(() => {
          this.$refs.password.focus();
          goTo(this.$refs.password.$refs.input, { offset: 15 });
        });
    },
    pin(pin) {
      this.form.pin = pin;
    },
    async submit(e) {
      if (e) e.preventDefault();
      if (!this.form.password || this.form.password === this.form.confirm) {
        // ensure currencies not broken
        if (this.form.currencies.length === 0)
          this.form.currencies.push("USD");

        this.saving = true;
        let res = await this.updateUser(this.form);
        this.$nextTick(() => (this.saving = false));

        if (this.user.currencies.indexOf(this.user.currency) === -1) {
          this.setCurrency(this.user.currencies[0]);
        }

        if (res) {
          this.changingPassword = false;
          window.scrollTo(0, 0);
          this.$store.commit('error', '');
          this.success = 'Settings saved successfully';
        }
      } else {
        this.$store.commit('error', "Passwords don't match");
      }
    },

    updateUser: call('updateUser'),
    setCurrency: call('setCurrency'),
    enable2fa: call('enable2fa'),
    disable2fa: call('disable2fa'),
  },

  watch: {
    token(v) {
      if (!this.user.twofa && v.length === 6) this.enable();
    },
    user(user) {
      if (!this.initialized) {
        Object.keys(user)
          .filter(key => key in this.form && user[key])
          .forEach(key => (this.form[key] = user[key]));
        this.form['password'] = '';
        this.form['confirm'] = '';
        try {
          this.form.currencies = JSON.parse(user.currencies);
        } catch (e) {
          /**/
        }
      }
    },
  },

  mounted() {
    let { user } = this;
    Object.keys(user)
      .filter(key => key in this.form && user[key])
      .forEach(key => (this.form[key] = user[key]));
    this.form['password'] = '';
    this.form['confirm'] = '';
    try {
      this.form.currencies = JSON.parse(user.currencies);
    } catch (e) {
      /**/
    }
  },
};
</script>

<style lang="stylus" scoped>
@media (max-width: 600px)
  .v-btn
    width 100%
    height 62px !important
</style>
