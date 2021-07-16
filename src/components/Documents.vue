<template lang='pug'>
  div
    h2 Developer Documents:
    ul
      li(v-for='doc in docs')
        a(:href='doc.link' target='newWin') {{doc.name}}
    
</template>

<script>

export default {
  data() {
    return {
      docs: [
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
      ]
    }
  }
}
</script>
