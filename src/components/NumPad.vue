<template lang="pug">
.numpad
  span.display-1 {{amount}}
  span.title.ml-1 {{currency}}
  template(v-for='i in buttons.length / 3')
    v-layout(row :key='i')
      v-flex(v-for='j in 3' xs4 :key='j')
        v-btn(@click='update(buttons[j + 3 * i - 4])' :ref='id(buttons[j  + 3 * i - 4])') 
          template(v-if='buttons[j + 3 * i - 4] !== "<"')
            | {{buttons[j + 3 * i - 4]}}
          v-icon(v-else) undo
</template>

<script>
export default {
  props: {
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'CAD',
    },
  },

  data () {
    return {
      buttons: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '<', '0', 'C'],
      codes: Array.from(Array(10), (_, x) => x + 48),
    }
  },

  computed: {
    precision () {
      if (this.currency === 'sats') return 0
      return 2
    },
  },

  methods: {
    id (n) {
      let prefix = 'button-'
      if (n === '<') return prefix + 'lt'
      return prefix + n
    },

    keyup (e) {
      let key = e.keyCode
      if (key > 57) key -= 48
      let id = this.codes.indexOf(key)
      if (key === 8) id = 'undo'
      if (key === 46 || key === 13) id = 'C'
      if (id < 0) return
      let event = { target: { innerHTML: id.toString() } }
      this.update(event)
    },

    update (m) {
      let amount = parseFloat(this.amount)

      if (m === '<') {
        amount = (Math.floor(100 * (parseFloat(amount) / 10)) / 100)
      } else if (amount < 1000 && this.precision) {
        amount = 10 * amount + parseFloat(m) / 100
      }

      if (m === 'C') amount = 0
      amount = amount.toFixed(this.precision)
      this.$emit('update', amount)
    },
  },

  created: function () {
    document.addEventListener('keyup', this.keyup)
  },

  destroyed: function () {
    document.removeEventListener('keyup', this.keyup)
  },
}
</script>


<style lang="stylus">
  .numpad .btn {
    min-width: 78px;
  }
</style>
