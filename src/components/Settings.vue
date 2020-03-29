<template>
  <div>
    {{ searchInput }}
    <v-progress-linear v-if="saving" indeterminate />
    <v-alert
      class="mb-4"
      color="success"
      icon="info"
      v-model="success"
      dismissible
      transition="scale-transition"
      >Settings saved successfully</v-alert
    >
    <v-card class="mb-2">
      <v-card-title>Security</v-card-title>
      <v-card-text>
        <div class="d-flex flex-wrap justify-center">
          <v-btn @click="changePassword" class="mr-sm-2 mb-2">
            <v-icon class="mr-1 yellow--text">lock</v-icon>
            <span>{{ user.password ? 'Change' : 'Set' }} Password</span>
          </v-btn>
          <v-btn
            @click.stop="showPinDialog = !showPinDialog"
            class="mr-sm-2 mb-2"
          >
            <v-icon class="mr-1 yellow--text">dialpad</v-icon>
            {{ user.pin ? 'Change' : 'Set' }} PIN
          </v-btn>
          <set-pin @pin="pin" :showPinDialog="showPinDialog" />
          <v-btn @click="twofa">
            <v-icon class="mr-1 yellow--text">stay_current_portrait</v-icon>
            {{ user.twofa ? 'Disable' : 'Setup' }} 2FA
          </v-btn>
        </div>
        <div v-if="set2fa">
          <v-card class="pa-3 text-center mb-2">
            <v-alert
              class="mb-4"
              color="error"
              icon="info"
              v-model="twofaFail"
              dismissible
              transition="scale-transition"
              >Invalid token, try again</v-alert
            >
            <div v-if="user.twofa">
              <label class="font-weight-bold">Enter Code to Disable</label>

              <pincode-input
                class="mx-auto yellow--text mb-2 d-block"
                v-model="token"
                :key="tokenKey"
                placeholder="0"
                :length="6"
              />
              <v-btn @click="disable">
                <v-icon class="mr-1 red--text">cancel</v-icon>
                <span>Disable</span>
              </v-btn>
            </div>
            <div v-else>
              <canvas
                id="qr"
                width="100"
                height="100"
                @click="fullscreen"
                class="w-100 mx-auto mb-2"
              />
              <div class="mb-2">
                <code
                  class="black--text"
                  :data-clipboard-text="user.otpsecret"
                  >{{ user.otpsecret }}</code
                >
              </div>

              <label class="font-weight-bold">Enter Code to Enable</label>

              <pincode-input
                class="mx-auto yellow--text mb-2 d-block"
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
            <v-text-field
              label="New Password"
              v-model="form.password"
              type="password"
              ref="password"
            />
            <v-text-field
              label="Confirm Password"
              v-model="form.passconfirm"
              type="password"
            />
            <div class="text-right">
              <v-btn @click="submit">
                <v-icon class="mr-1 yellow--text">check</v-icon>
                <span>Save</span>
              </v-btn>
            </div>
          </v-form>
        </div>
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-text>
        <v-form @keyup.native.enter="submit">
          <v-alert
            class="mb-4"
            color="info"
            icon="info"
            v-model="verifyingEmail"
            dismissible
            transition="scale-transition"
            >An email has been sent with a link for you to click on</v-alert
          >
          <v-text-field
            v-if="!user.fbtoken"
            label="Username"
            v-model="form.username"
            type="text"
          />

          <v-autocomplete
            v-model="form.currencies"
            :items="currencies"
            chips
            label="Currencies"
            multiple
            @change="filterCurrencies"
            :menu-props="{ maxHeight: 200, }"
            :search-input.sync="searchInput"
          >
            <template v-slot:selection="{ attrs, item, select, selected }">
              <v-chip
                v-bind="attrs"
                :input-value="selected"
                close
                @click="select"
                @click:close="remove(item)"
              >
                <strong>{{ item }}</strong>
              </v-chip>
            </template>
          </v-autocomplete>

          <div class="text-right">
            <v-btn @click="submit">
              <v-icon class="mr-1 yellow--text">check</v-icon>
              <span>Save</span>
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import validator from 'email-validator';
import SetPin from './SetPin';
import qr from 'qrcode';
import PincodeInput from 'vue-pincode-input';
import FullScreen from '../mixins/FullScreen';

export default {
  components: { SetPin, PincodeInput },
  mixins: [FullScreen],
  data() {
    return {
      tokenKey: 'a',
      twofaFail: false,
      token: '',
      full: false,
      saving: false,
      searchInput: "",
      showPinDialog: false,
      success: false,
      changingPassword: false,
      set2fa: false,
      initialized: false,
      code: '',
      dialog: false,
      form: {
        username: '',
        password: '',
        passconfirm: '',
        currency: '',
        currencies: '',
        email: '',
        phone: '',
        phoneCode: '',
        pin: '',
        notify: 'Email',
        twofa: false,
      },
      verifyingEmail: false,
      verifyingPhone: false,
    };
  },

  computed: {
    ...mapGetters(['error', 'rates', 'user']),
    currencies() {
      return this.rates ? Object.keys(this.rates).sort() : [];
    },
  },

  methods: {
    clear() {
      this.tokenKey += 'a';
      this.token = '';
    },
    async disable() {
      try {
        this.twofaFail = false;
        await this.disable2fa(this.token);
        this.twofa();
      } catch (e) {
        this.twofaFail = true;
      }
      this.clear();
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
    filterCurrencies() {
      this.form.currencies = this.form.currencies.filter(c =>
        this.currencies.includes(c)
      );
    },
    remove(item) {
      this.form.currencies.splice(this.form.currencies.indexOf(item), 1);
      this.form.currencies = [...this.form.currencies];
    },
    twofa() {
      this.set2fa = !this.set2fa;
      this.$nextTick(() => {
        let canvas = document.getElementById('qr');
        let { otpsecret, username } = this.user;
        let uri = `otpauth://totp/CoinOS:${username}?secret=${otpsecret}&period=30&digits=6&algorithm=SHA1&issuer=CoinOS`;
        if (!canvas) return;

        qr.toCanvas(canvas, uri, e => {
          if (e) console.log(e);
        });
      });
    },
    changePassword() {
      this.changingPassword = !this.changingPassword;
      this.$nextTick(() => {
        this.$refs.password.focus();
        window.scrollTo(0, this.$refs.password.offsetTop);
      });
    },
    pin(pin) {
      this.form.pin = pin;
    },
    async submit(e) {
      if (e) e.preventDefault();
      if (!this.form.password || this.form.password === this.form.passconfirm) {
        this.saving = true;
        let res = await this.updateUser(this.form);
        this.$nextTick(() => (this.saving = false));

        if (res) {
          this.success = true;
          this.changingPassword = false;
          window.scrollTo(0, 0);
          setTimeout(() => (this.success = false), 5000);
          this.$store.commit('error', '');
        }
      } else {
        this.$store.commit('error', "Passwords don't match");
      }
    },

    ...mapActions(['updateUser', 'enable2fa', 'disable2fa', 'getOtpSecret']),
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
        this.form['passconfirm'] = '';
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
    this.form['passconfirm'] = '';
    try {
      this.form.currencies = JSON.parse(user.currencies);
    } catch (e) {
      /**/
    }
    this.getOtpSecret();
  },
};
</script>

<style lang="stylus" scoped>
@media (max-width: 600px)
  .v-btn
    width 100%
    height 62px !important

canvas
  position relative
  display block
  height 100%
  margin-left auto
  margin-right auto
</style>
