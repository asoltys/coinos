<template>
  <div>
    <v-btn @click.stop="open">
      Set PIN
    </v-btn>
    <v-dialog v-model="dialog" width="500" @click:outside="close">
      <v-card>
        <v-card-title class="headline" primary-title>
          {{ confirming ? 'Confirm' : 'Set' }} PIN
        </v-card-title>

        <v-card-text>
          <v-alert v-if="mismatch" color="red">PIN mismatch</v-alert>
        </v-card-text>

        <v-card-text class="text-center">
          <v-alert v-if="success" color="green">PIN Set Successfully!</v-alert>

          <div v-else>
            <pincode-input
              v-if="confirming"
              class="mx-auto yellow--text"
              v-model="verifyPin"
              placeholder="0"
              :length="6"
              @keyup="handleverifyPin"
              ref="verifyPin"
              :key="verifyPinKey"
              :autofocus="false"
            />
            <pincode-input
              v-if="!confirming"
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
import { sync } from 'vuex-pathify';
export default {
  components: { PincodeInput },
  data() {
    return {
      dialog: false,
      confirming: false,
      newPin: '',
      verifyPin: '',
      mismatch: false,
      success: false,
      newPinKey: 'a',
      verifyPinKey: 'b',
    };
  },
  computed: {
    user: sync('user'),
  },
  methods: {
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
        this.mismatch = false;
        this.success = true;
      } else {
        this.mismatch = true;
        this.clear();
      }
    },
    close() {
      this.clear();
      this.success = false;
      this.mismatch = false;
      this.$nextTick(() => (this.dialog = false));
    },
    clear() {
      this.newPinKey += 'a';
      this.verifyPinKey += 'b';
      this.newPin = '';
      this.verifyPin = '';
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
