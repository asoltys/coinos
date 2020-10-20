<template>
  <div>
    <lnurl v-if="lnurl && lnurl.encoded" :lnurl="lnurl" />
    <div v-else>
      <amount
        label="Amount"
        v-model.number="amount"
        :max="user.account.balance"
        class="mb-2"
        :button="false"
        :startEditing="true"
      />
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
      <v-btn-toggle
        tile
        color="primary accent-3"
        group
        class="d-flex flex-wrap mx-auto"
      >
        <v-btn
          @click.native="toggleMemo"
          class="flex-grow-1"
        >
          <v-icon left color="blue">$note</v-icon>
          Memo
        </v-btn>
        <v-btn dark @click="submit" class="flex-grow-1">
          <v-icon left color="green">$send</v-icon><span>Go</span>
        </v-btn>
      </v-btn-toggle>
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
