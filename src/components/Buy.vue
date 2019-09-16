<template>
  <v-card class="text-center pa-4">
    <form action="/api/payment" method="post">
      <v-radio-group name="amount" label="Amount" v-model="product.amount">
        <v-radio
          class="d-block"
          v-for="i in items"
          :label="i.text"
          :value="i.value"
          :key="i.value"
        />
        <v-text-field class="mt-4" label="Custom" v-model="amount" autofocus />
      </v-radio-group>
      <stripe-checkout
        :stripe-key="stripe"
        :product="product"
        button="Buy"
        button-class="v-btn pa-4 success"
        on-success="broadcast"
      />
    </form>
  </v-card>
</template>

<script>
import { Bus, StripeCheckout } from 'vue-stripe';
import { mapGetters, mapActions } from 'vuex';

export default {
  components: { StripeCheckout },

  data() {
    return {
      amount: null,
      product: {
        name: 'Bitcoin',
        description: 'Currency of the future',
        amount: 2500,
      },
      items: [],
      stripe: process.env.VUE_APP_STRIPE,
    };
  },

  watch: {
    amount: {
      handler(v) {
        this.product.amount = v * 100;
      },
    },
  },

  computed: {
    ...mapGetters(['rate']),
  },

  methods: mapActions(['buy', 'snack']),

  async mounted() {
    Bus.$off('vue-stripe.success');
    Bus.$once('vue-stripe.success', payload => {
      let { token } = payload;
      let { amount } = this.product;
      this.buy({ amount, token });
    });

    this.items = [
      { text: '$25', value: 2500 },
      { text: '$50', value: 5000 },
      { text: '$100', value: 10000 },
    ];
  },
};
</script>
