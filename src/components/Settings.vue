<template>
  <v-form @submit="submit">
    <v-alert
      class="black--text mb-4"
      color="yellow"
      icon="info"
      v-model="verifyingEmail"
      dismissible
      transition="scale-transition"
      >An email has been sent with a link for you to click on</v-alert
    >
    <v-card>
      <v-card-text>
        <v-text-field label="Email" v-model="form.email" type="text">
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
            ><span class="red--text" v-else>
              <v-icon class="mr-1" color="red">error</v-icon
              ><span>Not Valid</span></span
            ></template
          >
        </v-text-field>
        <v-btn
          v-if="
            (form.email != user.email || !user.emailVerified) &&
              validate(form.email)
          "
          @click="challengeEmail"
          >Verify</v-btn
        >
        <v-layout>
          <v-text-field
            label="Phone"
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
              <span class="red--text" v-else>
                <v-icon class="mr-1" color="red">error</v-icon
                ><span>Not Valid</span></span
              >
            </template>
          </v-text-field>
          <v-btn
            v-if="
              form.phone.length === 10 &&
                (!user.phoneVerified || user.phoneVerified === '0')
            "
            @click="challengePhone"
            >Verify</v-btn
          >
        </v-layout>
        <v-layout>
          <v-alert
            class="black--text mb-4"
            v-if="!user.phoneVerified"
            color="yellow"
            icon="info"
            v-model="verifyingPhone"
            dismissible
            transition="scale-transition"
            >A 6 digit code will be texted to your phone. Enter it
            below:</v-alert
          >
        </v-layout>
        <v-layout
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
        </v-layout>

        <v-autocomplete
          :items="Object.keys(rates).sort()"
          v-model="form.currency"
          name="currency"
        ></v-autocomplete>
        <v-switch
          label="Two-Factor Authentication"
          v-model="form.twofa"
          :disabled="!(user.emailVerified && user.phoneVerified)"
        ></v-switch>
        <v-btn @click="save">Save Settings</v-btn>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import validator from 'email-validator';

export default {
  data() {
    return {
      form: {
        currency: '',
        email: '',
        password: '',
        passconfirm: '',
        phone: '',
        phoneCode: '',
        pin: '',
        pinconfirm: '',
        notify: 'Email',
        twofa: false,
      },
      verifyingEmail: false,
      verifyingPhone: false,
    };
  },

  computed: mapGetters(['rates', 'user']),

  methods: {
    updatePhone() {
      this.form.phoneCode = '';
    },

    save() {
      this.submit();
      this.$router.push('/home');
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

    submit(e) {
      if (e) e.preventDefault();
      this.updateUser(this.form);
    },

    ...mapActions([
      'updateUser',
      'requestEmail',
      'requestPhone',
      'verifyPhone',
    ]),
  },

  mounted() {
    Object.keys(this.user)
      .filter(key => key in this.form && this.user[key])
      .forEach(key => (this.form[key] = this.user[key]));
  },
};
</script>
