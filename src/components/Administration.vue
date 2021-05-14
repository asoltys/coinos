<template lang='pug'>
  div
    v-tabs(v-model='tab' dark)
      v-tab(v-for='section in sections' :key='section' @click="error=''") {{section}}
    v-container
      v-tabs-items(v-model="tab")
        v-tab-item(key="Users")
          h3 User data
          v-btn(@click='getUsers()' color='green') List Users
          p
            hr
          v-container
            v-data-table(v-if='users && users.length' :headers='uHeaders' :items='users')
            b(v-else-if='users') No Users
        v-tab-item(key="Referrals")
          h3 Referrals
          v-btn(@click='getReferrals()'  color='green') List Referrals
          v-data-table(v-if='referrals && referrals.length' :headers='uHeaders' :items='referrals')
        v-tab-item(key="Stats")
          h3 Stats
      v-alert.text-center.red--text(v-if='error') {{error}}
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
import axios from 'axios'
export default {
  data() {
    return {
      sections: ['Users', 'Referrals', 'Stats'],
      tab: '',
      error: '',
      users: null,
      uHeaders: [
        {text: 'username', value: 'username'},
        {text: 'email', value: 'email'},
        {text: 'sms', value: 'sms'}
      ],

      referrals: null,
      rHeaders: [
        {text: 'sponsor_id', value: 'sponsor_id'},
        {text: 'token', value: 'token'},
        {text: 'status', value: 'status'}
      ]
    } 
  },
  computed: {
    user: get('user'),
  },
  methods: {
    parseHeaders (data) {
      var keys = Object.keys(data)
      var headers = []
      for (var i = 0; i < keys.length; i++) {
        headers.push({text: keys[i], value: keys[i]})
      }
      return headers
    },
    getUsers () {
      // eg.
      // this.users = [
      //   {username: 'ran', email: 'ran.guin@gmail.com', sms: '604 731-1124'},
      //   {username: 'bob', email: 'bob@gmail.com'}
      // ]

      axios
        .get('/admin/users')
        .then( response => {
          this.users = response.users || []
        })
        .catch( err => {
          this.error = 'Error retrieving users'
        })
    },
    getReferrals () {
      axios
        .get('/admin/referrals')
        .then( response => {
          this.referrals = response.referrals || []
        })
        .catch( err => {
          this.error = 'Error retrieving referrals'
        })
    }

  }
};
</script>
