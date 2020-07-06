<template>
  <div>
    <div v-if="result && result.encoded">
      <qr :text="result.encoded" />
      <div class="d-flex justify-center">
        <v-btn @click="window.location = `lightning:${result.encoded}`">
          <v-icon left color="yellow">open_in_new</v-icon>
          Open
        </v-btn>
      </div>
      <v-textarea
        label="LNURL"
        :value="result.encoded"
        rows="1"
        auto-grow
        readonly
      >
        <template v-slot:append>
          <v-btn @click="() => copy(result.encoded)" icon class="ml-1">
            <v-icon>content_copy</v-icon>
          </v-btn>
        </template>
      </v-textarea>
    </div>
    <div v-else>
      <amount label="Minimum Withdrawal" v-model.number="min" :max="max" />
      <amount label="Maximum Withdrawal" v-model.number="max" :max="max" class="mb-2" />
      <div class="d-flex">
        <v-btn
          class="black--text flex-grow-1"
          color="primary"
          dark
          @click="submit"
        >
          <v-icon left>card_giftcard</v-icon><span>Generate Voucher</span>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
import Amount from './Amount';
import Qr from './Qr';
import Copy from '../mixins/Copy';

export default {
  components: { Amount, Qr },
  mixins: [Copy],
  data() {
    return {
      min: 1,
      max: null,
      result: null,
    };
  },
  methods: {
    getWithdrawUrl: call('getWithdrawUrl'),
    async submit() {
      let { min, max } = this;
      this.result = await this.getWithdrawUrl({ min, max });
    },
  },
  computed: {
    user: get('user'),
  },
  async mounted() {
    this.max = this.user.account.balance;
  },
};
</script>
