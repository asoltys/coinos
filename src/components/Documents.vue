<template lang='pug'>
  div
    div(v-if='user && user.admin')
      v-container
        v-card()
          v-card-title Private Documents:
          v-card-text
            ul
              li(v-for='doc in docs.private')
                a(:href='doc.link' :target='target(doc)' @click='open(doc)') {{doc.name}}
      hr
    v-progress-linear(v-else-if='loading' indeterminate='')
    div
      v-container
        v-card()
          v-card-title Public Documents:
          // This can be used to enable easy access to specific user help on various topics.
          v-card-text
            ul
              li(v-for='doc in docs.public')
                a(:href='doc.link' :target='target(doc)' @click='open(doc)') {{doc.name}}
    hr
    iframe(v-if='embedded' name='embedded' src='' scrolling='auto' frameborder=1 width='100%' height=1100 style='background-color: white')

</template>

<script>
import { call, get } from 'vuex-pathify';

import DynamicLoad from '@/mixins/DynamicLoad'

export default {
  props: {},
  mixins: [
    DynamicLoad
  ],
  data() {
    return {
      docs: { 
        // Private Docs
        private: [
          {
            name: 'Sprint / Test Protocol',
            link: 'https://docs.google.com/document/d/1wTFVziDXxG4tsAZkP-aUrBIZgJ1MqeQlWw8_ggEPa3k/edit?usp=sharing'
          },
          {
            name: 'Baseline Tests',
            link: 'https://docs.google.com/spreadsheets/d/1mJnLkFd7DeNAj_Mr_jXyKy9aexhvbDqOvLQSeU4WNIU/edit?usp=sharing'
          },
          {
            name: 'DB Schema - Transactions',
            link: 'https://docs.google.com/presentation/d/1aNEFr5s4M_pqqlk8txI61zWMc3_dM_SdtFwmirr_NV4/edit?usp=sharing'
          },
          {
            name: 'DB Schema - User Data',
            link: 'https://docs.google.com/presentation/d/1Cuth0Z-k7042kW2zxBDnSAZOiKVEEF5kxlQR0QfBKrs/edit?usp=sharing'
          }
        ],
        // Public Docs
        public: [
          {
            name: 'About Us',
            link: 'https://corporate.coinos.io/about',
            embed: true
          },
          {
            name: 'FAQ',
            link: 'https://corporate.coinos.io/faq',
            embed: true
          }
        ]
      },
      loading: true,
      embedded: false
    }
  },
  async mounted () {
    await this.waitForUser(5)
    this.loading = false
  },
  computed: {
    user: get('user'),
  },
  methods: {
    target (doc) {
      if (doc.embed) {
        return 'embedded'
      } else {
        return 'newWin'
      }
    },
    open (doc) {
      if (doc.embed) {
        this.embedded = true
      } else {
        this.embedded = false
      }
    }
  }
}
</script>
