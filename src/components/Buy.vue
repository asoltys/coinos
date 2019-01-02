<template lang="pug">
  form(action='/api/payment' method='post')
    v-radio-group(name='amount' label='Amount' v-model='product.amount')
      v-radio(v-for='i in items' :label='i.text' :value='i.value' :key='i.value')
    stripe-checkout(
      :stripe-key='stripe'
      :product='product'
      button='Buy Bitcoin / Dump Dollars'
      button-class='v-btn'
      on-success='broadcast'
    )

</template>


<script>
import { Bus, StripeCheckout } from 'vue-stripe'
import { mapGetters, mapActions } from 'vuex'

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

  methods: mapActions(['buy', 'snack']),

  async mounted () {
    Bus.$off('vue-stripe.success')
    Bus.$once('vue-stripe.success', payload => {
      let { token } = payload
      let { amount } = this.product
      this.buy({ amount, token })
    })

    this.items = [
      { text: '$25', value: 2500 },
      { text: '$50', value: 5000 },
      { text: '$100', value: 10000 },
    ]
  },
}
</script>
