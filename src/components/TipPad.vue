<template lang="pug">
div
  span.display-1 {{tip}}
  v-layout
    v-flex
      v-btn(:class='percent === 0 && "secondary"' @click='percent = 0') No Tip
      v-btn(:class='percent === 10 && "secondary"' @click='percent = 10') +10%
      v-btn(:class='percent === 15 && "secondary"' @click='percent = 15') +15%
      v-btn(:class='percent === 20 && "secondary"' @click='percent = 20') +20%
</template>

<script>
export default {
  props: {
    amount: {
      type: Number,
      default: 0,
    },
  },

  data () {
    return {
      percent: 0,
    }
  },

  computed: {
    tip () {
      let tip = (this.percent * this.amount * 0.01).toFixed(2)
      this.$emit('update', tip)
      return tip
    },
  },
}
</script>
