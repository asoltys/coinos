<template>
  <div>
    <lnurl v-if="lnurl && lnurl.encoded" :lnurl="lnurl" />
    <div v-else>
      <amount label="Amount" v-model.number="amount" :max="user.account.balance" class="mb-2" :button="false" :startEditing="true" />
    <v-textarea
      v-if="payment.memo || showMemo"
      label="Memo"
      v-model="payment.memo"
      rows="1"
      ref="memo"
      auto-grow
      auto-focus
      @keydown.enter.prevent="submit"
    />
    <div class="d-flex flex-wrap mb-sm-1">
      <v-btn
        @click.native="toggleMemo"
        class="flex-grow-1 wide mr-1 mb-1 mb-sm-0"
      >
        <v-icon left color="green">$note</v-icon>
        {{ showMemo ? 'Remove' : 'Add' }} Memo
      </v-btn>
    </div>
      <div class="d-flex flex-wrap">
        <v-btn dark @click="submit" class="flex-grow-1 mb-2 mr-1 wide">
          <v-icon left color="pink">$gift</v-icon
          ><span>Create Voucher</span>
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
      showMemo: false,
      min: 1,
      amount: null,
      lnurl: null,
    };
  },
  methods: {
    toggleMemo() {
      this.showMemo = !this.showMemo;
      this.$nextTick(() => {
        if (this.showMemo) this.$refs.memo.focus();
        else this.payment.memo = '';
      });
    },
    sendInternal: call('sendInternal'),
    async submit() {
      this.payment.amount = this.amount;
      this.payment.method = 'url';
      this.payment.recipient = { username: null };
      await this.sendInternal();
    },
  },
  computed: {
    error: sync('error'),
    payment: get('payment'),
    user: get('user'),
  },
};
</script>
