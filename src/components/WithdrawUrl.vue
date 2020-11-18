<template>
  <div>
    <lnurl v-if="lnurl && lnurl.encoded" :lnurl="lnurl" />
    <div v-else>
      <amount label="Minimum Withdrawal" v-model.number="min" :max="max" />
      <amount
        label="Maximum Withdrawal"
        v-model.number="max"
        :max="max"
        class="mb-2"
      />
      <div class="d-flex">
        <v-btn
          class="black--text flex-grow-1"
          color="primary"
          dark
          @click="submit"
        >
          <v-icon left>$gift</v-icon><span>Generate Voucher</span>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
import Amount from './Amount';
import Lnurl from './Lnurl';

export default {
  components: { Amount, Lnurl },
  data() {
    return {
      min: 1,
      max: null,
      lnurl: null,
    };
  },
  methods: {
    getWithdrawUrl: call('getWithdrawUrl'),
    async submit() {
      let { min, max } = this;
      this.lnurl = await this.getWithdrawUrl({ min, max });
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
