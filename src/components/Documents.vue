<template lang='pug'>
  div
    div(v-if='user && user.admin')
      h2 Private Documents:
      ul
        li(v-for='doc in docs.private')
          a(:href='doc.link' target='newWin') {{doc.name}}
      hr
    v-progress-linear(v-else-if='loading' indeterminate='')
    div
      h2 Public Documents:
        ul
          li(v-for='doc in docs.public')
            a(:href='doc.link' target='newWin') {{doc.name}}

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
            link: 'https://corporate.coinos.io/about'
          },
          {
            name: 'FAQ',
            link: 'https://corporate.coinos.io/about'
          }
        ]
      },
      loading: true
    }
  },
  async mounted () {
    await this.waitForUser(5)
    this.loading = false
  },
  computed: {
    user: get('user'),
  }
}
</script>
