<template>
  <div>
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
            <span>Change Password</span>
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
            Setup 2FA
          </v-btn>
        </div>
        <div v-if="set2fa">
          <h1>Coming soon</h1>
        </div>
        <div v-if="changingPassword" class="mb-2">
          <v-form @keyup.native.enter="submit">
            <v-text-field
              label="New Password"
              v-model="form.password"
              type="password"
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
          <v-text-field label="Username" v-model="form.username" type="text" />
          <v-text-field
            label="Email (optional)"
            v-model="form.email"
            type="text"
          >
            <template slot="append"
              ><span
                class="green--text"
                v-if="user.emailVerified && form.email === user.email"
              >
                <v-icon class="mr-1" color="green">info</v-icon
                ><span>Verified</span></span
              ><span class="yellow--text" v-else-if="validate(form.email)">
                <v-icon class="mr-1" color="yellow">warning</v-icon
                ><span>Not Verified</span></span
              ><span class="red--text" v-else-if="form.email">
                <v-icon class="mr-1" color="red">error</v-icon
                ><span>Not Valid</span></span
              ></template
            >
          </v-text-field>
          <div class="text-center">
            <v-btn
              v-if="
                (form.email != user.email || !user.emailVerified) &&
                  validate(form.email)
              "
              class="mb-2"
              @click="challengeEmail"
            >
              <v-icon class="mr-1 yellow--text">email</v-icon
              ><span>Confirm Email</span></v-btn
            >
          </div>
          <v-text-field
            label="Phone (optional)"
            v-model="form.phone"
            type="text"
            mask="phone"
            @change="updatePhone"
          >
            <template slot="append">
              <span
                class="green--text"
                v-if="
                  user.phoneVerified &&
                    user.phoneVerified !== '0' &&
                    form.phone === user.phone
                "
              >
                <v-icon class="mr-1" color="green">info</v-icon
                ><span>Verified</span></span
              >
              <span class="yellow--text" v-else-if="form.phone.length === 10">
                <v-icon class="mr-1" color="yellow">warning</v-icon
                ><span>Not Verified</span></span
              >
              <span class="red--text" v-else-if="form.phone">
                <v-icon class="mr-1" color="red">error</v-icon
                ><span>Not Valid</span></span
              >
            </template>
          </v-text-field>
          <div class="text-center">
            <v-btn
              class="mb-2"
              v-if="
                form.phone.length === 10 &&
                  (!user.phoneVerified ||
                    user.phoneVerified === '0' ||
                    user.phone !== form.phone)
              "
              @click="challengePhone"
            >
              <v-icon class="mr-1 yellow--text">sms</v-icon
              ><span>Confirm Phone</span>
            </v-btn>
          </div>
          <v-alert
            class="mb-4"
            v-if="!user.phoneVerified"
            color="info"
            icon="info"
            v-model="verifyingPhone"
            dismissible
            transition="scale-transition"
            >A 6 digit code will be texted to your phone. Enter it
            below:</v-alert
          >
          <div
            v-if="
              verifyingPhone &&
                form.phone.length === 10 &&
                !(user.phoneVerified && user.phone === form.phone)
            "
          >
            <v-text-field
              label="Code"
              v-model="form.phoneCode"
              ref="phoneCode"
              type="text"
              @keyup="checkCode"
            ></v-text-field>
          </div>

          <v-combobox
            v-model="form.currencies"
            :items="currencies"
            chips
            label="Currencies"
            multiple
            @change="oy"
            :menu-props="{
              maxHeight: 200,
              closeOnClick: true,
              closeOnContentClick: true,
            }"
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
          </v-combobox>

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

export default {
  components: { SetPin },
  data() {
    return {
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
    oy() {
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
    },
    changePassword() {
      this.changingPassword = !this.changingPassword;
    },
    pin(pin) {
      this.form.pin = pin;
    },
    updatePhone() {
      this.form.phoneCode = '';
    },

    checkCode() {
      if (this.form.phoneCode && this.form.phoneCode.length === 6)
        this.verifyPhone({
          username: this.user.username,
          token: this.form.phoneCode,
        });
    },

    validate(email) {
      return validator.validate(email);
    },

    challengeEmail() {
      this.verifyingEmail = true;
      this.submit();
      this.requestEmail(this.form.email);
    },

    challengePhone() {
      this.verifyingPhone = true;
      this.submit();
      this.requestPhone(this.form.phone);
      this.$nextTick(() => this.$refs.phoneCode.focus());
    },

    async submit(e) {
      if (e) e.preventDefault();
      if (!this.form.password || this.form.password === this.form.passconfirm) {
        let res = await this.updateUser(this.form);
        console.log("result", res);
        if (res) {
          this.success = true;
          window.scrollTo(0, 0);
          setTimeout(() => (this.success = false), 5000);
          this.$store.commit('error', '');
        }
      } else {
        this.$store.commit('error', "Passwords don't match");
      }
    },

    ...mapActions([
      'updateUser',
      'requestEmail',
      'requestPhone',
      'verifyPhone',
    ]),
  },

  watch: {
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
  },
};
</script>

<style lang="stylus" scoped>
@media (max-width: 600px)
  .v-btn
    width 100%
    height 70px !important
</style>
