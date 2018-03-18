<template lang="pug">
  div
    template(v-if='choosefrom || chooseto')
      v-date-picker(v-if='choosefrom' v-model='fromstring' color='secondary' @input='choosefrom = false')
      v-date-picker(v-if='chooseto' v-model='tostring' color='secondary' @input='chooseto = false')
    template(v-else)
      v-layout
        v-flex(xs4)
          v-btn(@click='choosefrom = !choosefrom; chooseto = false' :color='choosefrom ? "green" : ""' small)
            v-icon.mr-1 event
            span {{from | short}}
        v-flex.ml-3.text-xs-center(xs2)
          div.pt-2.subheading to
        v-flex(xs4)
          v-btn(@click='chooseto = !chooseto; choosefrom = false' :color='chooseto ? "green" : ""' small)
            v-icon.mr-1 event
            span {{to | short}}
      v-layout
        v-flex(xs12)
          v-select(:items='Object.keys(presets)' v-model='preset')
    v-list(three-line subheader)
      template(v-for='(payment, i) in filteredPayments')
        v-list-tile(background='blue' :key='payment.date' @click='5')
          v-list-tile-content
            v-list-tile-title {{payment.hash | trim}}
            v-list-tile-sub-title(:class='color(payment)') {{payment.amount | abs}} sats
            v-list-tile-sub-title(:class='color(payment)') {{payment.fiat | abs}} CAD
          v-list-tile-action
            v-list-tile-action-text {{payment.createdAt | format}}
            v-list-tile-sub-title balance: {{payment.balance}}
            v-layout
              v-icon mdi-comment-outline
</template>

<script>
import { format, parse, isBefore, isSameDay, isWithinRange, subWeeks, subMonths, subYears } from 'date-fns'
import { mapGetters } from 'vuex'

export default {
  filters: {
    abs: v => Math.abs(v),
    format: d => format(d, 'YYYY-MM-DD HH:mm'),
    short: d => format(d, 'MMM D, \'YY'),
    trim: s => s.substr(0, 18),
  },

  data () {
    return {
      presets: {
        'Last Week': {
          from: subWeeks(Date.now(), 1),
          to: Date.now(),
        },
        'Last Month': {
          from: subMonths(Date.now(), 1),
          to: Date.now(),
        }, 
        'Last Year': {
          from: subYears(Date.now(), 1),
          to: Date.now(),
        },
        'Custom': {
          from: null,
          to: null,
        },
      },
      choosefrom: false,
      chooseto: false,
      currency: 'CAD',
      subtotal: 0,
      total: 0,
      tips: 0,
      quick: 'Last Week',
      from: subWeeks(Date.now(), 1),
      to: Date.now(),
    }
  },

  computed: {
    ...mapGetters(['payments']),

    preset: {
      get () { 
        let preset = 'Custom'
        let { from, to } = this
        Object.keys(this.presets).map(k => {
          let p = this.presets[k]
          if (isSameDay(p.from, from) && isSameDay(p.to, to)) {
            preset = k  
          } 
        })

        return preset
      },
      set (v) { 
        if (v === 'Custom') return
        this.from = this.presets[v].from
        this.to = this.presets[v].to 
      },
    },

    fromstring: {
      get () { return format(this.from, 'YYYY-MM-DD') },
      set (v) { this.from = parse(v) },
    },

    tostring: {
      get () { return format(this.to, 'YYYY-MM-DD') },
      set (v) { this.to = parse(v) },
    },

    filteredPayments () {
      if (!this.payments.length) return []
      this.$nextTick(() => this.$emit('mask'))
      let balance = 0
      return this.payments
        .map(p => { 
          let o = JSON.parse(JSON.stringify(p))
          o.fiat = (p.amount * p.rate / 100000000).toFixed(2)
          balance += parseFloat(p.amount)
          o.balance = balance
          return o 
        })
        .filter(p => isWithinRange(parse(p.createdAt), this.from, this.to))
        .sort((a, b) => { 
          if (isBefore(parse(a.createdAt), parse(b.createdAt))) {
            return 1
          }
          return -1
        })
    },
  },

  methods: {
    color (p) { return p.amount < 0 ? 'sent' : 'received' },
  },

  mounted () {
    this.$store.dispatch('getPayments')
  },
}
</script>

<style lang="stylus" scoped>
  .sent
    color rgb(255, 185, 85) !important

  .received
   color rgb(180, 255, 0) !important
</style>
