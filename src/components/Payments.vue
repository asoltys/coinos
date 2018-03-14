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
        v-flex(xs2)
          div.pt-2.pl-3.title -
        v-flex(xs4)
          v-btn(@click='chooseto = !chooseto; choosefrom = false' :color='chooseto ? "green" : ""' small)
            v-icon.mr-1 event
            span {{to | short}}
      v-layout
        v-flex(xs12)
          v-select(:items='Object.keys(presets)' v-model='preset')
    v-list(three-line subheader)
      template(v-for='(tx, i) in decoded')
        v-list-tile(background='blue' :key='tx.date' @click='5')
          v-list-tile-content
            v-list-tile-title {{tx.paymentRequest | trim}}
            v-list-tile-sub-title {{tx.satoshis}} sats
            v-list-tile-sub-title $26.02 CAD
          v-list-tile-action
            v-list-tile-action-text {{tx.timestampString | format}}
            v-layout
              v-icon(v-if='tx.paymentRequest.includes(50)') mdi-comment-outline
              v-icon(v-else color='blue lighten-3') mdi-comment 
              v-icon(v-if='tx.paymentRequest.includes("mw")') mdi-karate
              v-icon(v-else color='yellow') mdi-flash
            v-list-tile-sub-title balance: 49725
</template>

<script>
import { format, parse, isBefore, isSameDay, isWithinRange, subWeeks, subMonths, subYears } from 'date-fns'
import { mapGetters } from 'vuex'
import bolt11 from 'bolt11'

export default {
  filters: {
    format: d => format(d, 'YYYY-MM-DD HH:mm'),
    short: d => format(d, 'MMM D, \'YY'),
    trim: s => s.substr(0, 18),
  },

  data () {
    return {
      presets: {
        'Last Month': {
          from: subMonths(Date.now(), 1),
          to: Date.now(),
        }, 
        'Last Week': {
          from: subWeeks(Date.now(), 1),
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
    ...mapGetters(['transactions']),

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

    decoded () {
      if (!this.transactions.length) return []
      return this.transactions
        .map(i => bolt11.decode(i.payreq))
        .filter(p => p.complete)
        .filter(p => isWithinRange(parse(p.timestampString), this.from, this.to))
        .sort((a, b) => { 
          if (isBefore(parse(a.timestampString), parse(b.timestampString))) {
            return 1
          }
          return -1
        })
    },
  },

  mounted () {
    this.$store.dispatch('getTransactions')
  },
}
</script>
