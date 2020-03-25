<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    <template v-else-if="text">
      <request v-if="received < amount" @clear="clear" />
      <balance v-else />
      <received v-if="received" @clear="clear" />
      <v-btn @click="clear" class="mb-2">
        <v-icon>arrow_back</v-icon><span>Go Back</span>
      </v-btn>
    </template>
    <div v-else>
      <numpad
        class="mr-4 mb-2"
        @done="() => generateRequest('lightning')"
        :initialAmount="amount"
        @input="updateAmount"
      />

      <div class="d-flex flex-wrap buttons">
        <v-btn class="flex-grow-1 mb-2 mr-2" @click="generateRequest('bitcoin')">
          <img class="mr-1" src="../assets/bitcoin.png" width="30px" />
          <span>Bitcoin</span>
        </v-btn>

        <v-btn
          class="flex-grow-1 mb-2 mr-2"
          @click="generateRequest('lightning')"
          :disabled="amount <= 0"
        >
          <flash fillColor="yellow" />
          <span>Lightning</span>
        </v-btn>

        <v-btn class="flex-grow-1 mr-0" @click="generateRequest('liquid')">
          <water fillColor="#00aaee" />
          <span>Liquid</span>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import Balance from './Balance';
import Numpad from './NumPad';
import Received from './Received';
import Request from './Request';
import { mapActions } from 'vuex';
import Flash from 'vue-material-design-icons/Flash';
import Water from 'vue-material-design-icons/Water';
import { get, call, sync } from 'vuex-pathify';

export default {
  components: { Balance, Flash, Numpad, Received, Request, Water },

  filters: {},

  data() {
    return {
      message: '',
      about: '',
      full: false,
      generated: false,
      showcode: false,
      bitreq: '',
    };
  },

  computed: {
    amount: sync('amount'),
    loading: sync('loading'),
    method: sync('method'),
    received: sync('received'),
    tip: sync('tip'),
    user: get('user'),
    payreq: get('payreq'),
    rate: get('rate'),
    text: sync('text'),
  },

  methods: {
    ...mapActions(['addInvoice', 'snack', 'shiftCurrency']),

    generateRequest: call('generateRequest'),

    updateAmount(e) {
      this.amount = e;
    },

    clear() {
      this.error = '';
      this.received = 0;
      this.text = '';
      this.tip = 0;
    },

    checkRefresh() {
      if (this.$route.query.refresh !== undefined) {
        this.$router.replace(this.$route.path);
      } else {
        this.clear();
      }
    },
  },

  beforeRouteUpdate(to, from, next) {
    next();
    this.checkRefresh();
  },

  mounted() {
    this.clear();
    this.checkRefresh();
  },
};
</script>

<style lang="stylus" scoped>
canvas
  position relative
  display block
  height 100%
  margin-left auto
  margin-right auto

.v-btn.subheading
  width 100%

@media (max-width: 600px)
  .buttons .v-btn
    width 100%
    height 62px !important
</style>
