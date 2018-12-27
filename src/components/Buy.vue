<template lang="pug">
  form(action='/api/payment' method='post')
    v-select(name='amount' :items="items" label="Amount" v-model="product.amount")
    stripe-checkout(
      :stripe-key='stripe'
      :product='product'
      button='Buy Bitcoin'
      button-class='v-btn'
      on-success='broadcast'
    )
</template>


<script>
import { Bus, StripeCheckout } from 'vue-stripe'
import { mapGetters, mapActions } from 'vuex'

const satoshi = 100000000

export default {
  components: { StripeCheckout },

  data () {
    return {
      product: {
        name: 'Bitcoin',
        description: 'Currency of the future',
        amount: 2500,
      },
      items: [],
      stripe: process.env.STRIPE,
    }
  },
  
  computed: {
    ...mapGetters(['rate']),
  }, 

  methods: mapActions(['getRates', 'buy', 'snack']),

  async mounted () {
    await this.getRates()

    Bus.$off('vue-stripe.success')
    Bus.$once('vue-stripe.success', payload => {
      let { token } = payload
      let { amount } = this.product
      this.buy({ amount, token })
    })

    this.items = [
      { text: '$25 (' + (satoshi * 25 / this.rate).toFixed(0) + ' satoshi)', value: 2500 },
      { text: '$50 (' + (satoshi * 50 / this.rate).toFixed(0) + ' satoshi)', value: 5000 },
      { text: '$100 (' + (satoshi * 100 / this.rate).toFixed(0) + ' satoshi)', value: 10000 },
    ]
  },
}
</script>
