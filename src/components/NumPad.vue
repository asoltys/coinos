<template lang="pug">
.numpad
  span.display-1 {{amount.toFixed(decimals)}}
  span.title.ml-1 {{currency}}
  v-container(fluid style="margin: 0px; padding: 0; margin-left: -15px")
    v-layout(v-for='i in buttons.length / 3' row :key='i')
      v-flex(v-for='j in 3' xs4 :key='j')
        v-btn(@click='update(buttons[j + 3 * i - 4])' :ref='id(buttons[j  + 3 * i - 4])' style="min-width: auto; width: 95%") 
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
    decimals () { return this.currency === 'sats' ? 0 : 2 },
    divisor () { return 10 ** this.decimals },
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
        amount = (Math.floor(this.divisor * (parseFloat(amount) / 10)) / this.divisor)
      } else if (amount < 1000000) {
        amount = 10 * amount + parseFloat(m) / this.divisor
      }

      if (m === 'C') amount = 0
      amount = amount.toFixed(this.decimals)
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

