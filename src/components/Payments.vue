<template lang="pug">
  v-list
    v-list-tile(v-for='tx in transactions' :key='tx.date')
      v-subheader {{tx.date | format}}
      v-list-tile-content
        v-list-tile-title {{tx.amount}}
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'

export default {
  filters: {
    format (date) {
      return moment(date).format('MMM D YYYY')
    },

    fiat (amount) {
      return amount * 6000
    },
  },

  data () {
    return {
      currency: 'CAD',
      subtotal: 0,
      total: 0,
      tips: 0,
      from: moment().subtract(7, 'days'),
      to: moment(),
    }
  },

  computed: {
    ...mapGetters(['transactions']),
  },

  mounted () {
    this.$store.dispatch('getTransactions')
  },
}
</script>
