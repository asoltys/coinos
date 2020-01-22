<template>
  <div>
    <v-btn @click.stop="open"> {{ user.pin ? 'Change' : 'Set' }} PIN </v-btn>
    <v-dialog v-model="dialog" width="500" @click:outside="close">
      <v-card>
        <v-card-title class="headline" primary-title>
          {{
            confirming
              ? 'Confirm'
              : user.pin
              ? user.pin === pin || success
                ? 'Set'
                : 'Old'
              : 'New'
          }}
          PIN
        </v-card-title>

        <v-card-text>
          <v-alert v-if="error" color="red">{{ error }}</v-alert>
        </v-card-text>

        <v-card-text class="text-center">
          <v-alert v-if="success" color="green">PIN Set Successfully!</v-alert>

          <div v-else>
            <pincode-input
              v-if="pinRequired"
              class="mx-auto yellow--text"
              v-model="oldPin"
              placeholder="0"
              :length="6"
              ref="oldPin"
              :key="oldPinKey"
            />
            <div v-show="!pinRequired">
              <pincode-input
                v-if="confirming"
                class="mx-auto yellow--text"
                v-model="verifyPin"
                placeholder="0"
                :length="6"
                ref="verifyPin"
                :key="verifyPinKey"
              />
              <pincode-input
                v-else
                class="mx-auto yellow--text"
                v-model="newPin"
                placeholder="0"
                :length="6"
                ref="newPin"
                :key="newPinKey"
              />

              <p class="mt-2">
                This PIN will be required to send outgoing payments
              </p>
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-btn v-if="!success" color="red" text @click="close">
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn v-if="success" color="primary" text @click="close">
            Done
          </v-btn>
          <v-btn v-else-if="confirming" color="primary" text @click="submit">
            Ok
          </v-btn>
          <v-btn
            v-else-if="pinRequired"
            color="primary"
            text
            @click="submitOldPin"
          >
            Ok
          </v-btn>
          <v-btn v-else color="primary" text @click="startConfirming">
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import PincodeInput from 'vue-pincode-input';
import { call, sync } from 'vuex-pathify';
export default {
  components: { PincodeInput },
  data() {
    return {
      dialog: false,
      confirming: false,
      newPin: '',
      verifyPin: '',
      oldPin: '',
      error: false,
      success: false,
      newPinKey: 'a',
      verifyPinKey: 'b',
      oldPinKey: 'c',
    };
  },
  computed: {
    pinRequired() {
      return this.user.pin && this.user.pin !== this.pin;
    },
    pin: sync('pin'),
    user: sync('user'),
  },
  methods: {
    updateUser: call('updateUser'),
    submitOldPin() {
      if (this.oldPin === this.user.pin) {
        this.pin = this.oldPin;
        this.error = '';
      } else {
        this.error = 'Wrong PIN, try again';
        this.clear();
      }
    },
    open() {
      this.dialog = true;
      this.$nextTick(() => {
        this.$refs.newPin.focusLetterByIndex(0);
      });
    },
    startConfirming() {
      this.confirming = true;
      this.$nextTick(() => {
        this.$refs.verifyPin.focusLetterByIndex(0);
      });
    },
    submit() {
      if (this.verifyPin === this.newPin) {
        this.$emit('pin', this.verifyPin);
        this.error = '';
        this.success = true;
        this.user.pin = this.verifyPin;
        this.updateUser(this.user);
      } else {
        this.error = 'PIN mismatch';
        this.clear();
      }
    },
    close() {
      this.pin = '';
      this.clear();
      this.success = false;
      this.error = '';
      this.$nextTick(() => (this.dialog = false));
    },
    clear() {
      this.newPinKey += 'a';
      this.verifyPinKey += 'b';
      this.oldPinKey += 'c';
      this.newPin = '';
      this.verifyPin = '';
      this.oldPin = '';
      this.confirming = false;
    },
  },
  watch: {
    newPin(v) {
      if (v.length === 6) this.startConfirming();
    },
    verifyPin(v) {
      if (v.length === 6) this.submit();
    },
  },
};
</script>
