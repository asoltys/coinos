<template>
  <div>
    <lnurl v-if="lnurl && lnurl.encoded" :lnurl="lnurl" />
    <div v-else>
      <amount label="Amount" v-model.number="amount" :max="user.account.balance" class="mb-2" :button="false" :startEditing="true" />
      <v-textarea label="Memo" v-model="payment.memo" rows="1" auto-grow />
      <div class="d-flex flex-wrap">
        <v-btn dark @click="voucher" class="flex-grow-1 mb-2 mr-1 wide">
          <v-icon left color="pink">$gift</v-icon
          ><span>Create Voucher</span>
        </v-btn>
        <v-btn dark @click="submit" class="flex-grow-1 mb-2 mr-1 wide">
          <flash fillColor="yellow" />
          <span>LNURL Withdrawal</span>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
import Amount from './Amount';
import Lnurl from './Lnurl';
import Flash from 'vue-material-design-icons/Flash';

export default {
  components: { Flash, Amount, Lnurl },
  data() {
    return {
      min: 1,
      amount: null,
      lnurl: null,
    };
  },
  methods: {
    sendInternal: call('sendInternal'),
    getWithdrawUrl: call('getWithdrawUrl'),
    async voucher() {
      this.payment.amount = this.amount;
      this.payment.method = 'url';
      this.payment.recipient = { username: null };
      this.sendInternal();
    },
    async submit() {
      this.error = null;
      this.lnurl = await this.getWithdrawUrl({ min: this.amount, max: this.amount });
    },
  },
  computed: {
    error: sync('error'),
    payment: get('payment'),
    user: get('user'),
  },
};
</script>
