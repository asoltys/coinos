<template lang='pug'>
  div
    v-tabs(v-model='tab' dark)
      v-tab(v-for='section in sections' :key='section' @click="resetData()") {{section}}
    v-container
      v-tabs-items(v-model="tab")
        v-tab-item(key="Users")
          v-row.justify-space-around
            v-btn(@click='getUsers()' color='green') List Users
            v-btn(@click='getAccounts()' color='green') List User Accounts
          p
          //-   hr
          //- v-container
          //-   v-data-table(v-if='users && users.length' :headers='uHeaders' :items='users')
          //-   b(v-else-if='users') No Users
        v-tab-item(key="Referrals")
          v-btn(@click='getReferrals()'  color='green') List Referrals
          //- v-data-table(v-if='referrals && referrals.length' :headers='uHeaders' :items='referrals')
        v-tab-item(key="Stats")
          h3 Stats
      p
        hr
      v-container
        v-data-table(v-if='showData && showData.length' :headers='showHeaders' :items='showData')
      p
        v-alert.text-center.green--text(v-if='message') {{message}}
        v-alert.text-center.red--text(v-if='error') {{error}}
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
import Vue from 'vue';

// import axios from 'axios'
export default {
  data() {
    return {
      sections: ['Users', 'Referrals', 'Stats'],
      tab: '',
      message: '',
      error: '',
      users: null,

      showData: [],
      showHeaders: [],
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
    resetData () {
      this.message = ''
      this.error = ''
      this.showData = []
      this.showHeaders = []
    },
    async getUsers () {
      this.resetData()
      console.log('get list of users via admin api ...')

      // Test case 
      var test = {"users":[{"subscriptions":null,"id":10385,"locked":false,"verified":null,"fiat":true,"index":0,"ip":3232235781,"seed":"U2FsdGVkX18Zr7W7NYXfykWSN/Je+NEYzSqj0Rrer9aBR2iAccO1fKsTW7bl/6xw3aK8wEAmAPYLvksheskpik7SNHRsQbmfTPfLplzcD5TR1p1PLBd++qRlS2egC5zR","username":"bob","password":"$2b$04$kr/k0tVH5Aztk5eEOAiGEO.DhyG8NkcqieCQUYOeoUm66.ft4p88K","unit":"BTC","account_id":15174,"otpsecret":"KFVEU7JZCAGU6ZZQ","currency":"USD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-11T04:03:34.000Z","updatedAt":"2021-05-15T18:24:57.000Z","twofa":null,"pin":null},{"subscriptions":null,"id":10386,"locked":false,"verified":null,"fiat":false,"index":0,"ip":3232235781,"seed":"U2FsdGVkX19rUB71XeC+GfzMhfzzxrhJhGbsXrRED7VqmDPVAPBNIGvgSTb5m9OAhMBlUxL+FObg9zmoqlMtYpRZMk1JUc81pUVMfY5S27jdw72wWBzdnwlNam5Q/Njx","username":"satoshi-7f77e652","password":"$2b$04$hxE.eJk/PqiHYBkFIHWGUu5FYjdxA1RFhbLdZjJdDN3N4/DNt3TFK","unit":"SAT","account_id":15175,"otpsecret":"KBRAAPI6LBWFIXAA","currency":"CAD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-11T12:56:57.000Z","updatedAt":"2021-05-11T12:56:57.000Z","twofa":null,"pin":null},{"subscriptions":null,"id":10387,"locked":false,"verified":null,"fiat":false,"index":0,"ip":3232235781,"seed":"U2FsdGVkX1+RaoXfP/0Y3PbTvenpoNbJtIoXWJP6kHsNTZkRQNOKSPCQLng/V3ikaZJc220U+aw2JRcvmaQ/svFgHd+Hz849tdLpgBwxq8QFjWA+rHQ+/vZKW7Q73d4Y","username":"satoshi-499dae2b","password":"$2b$04$CT2PESDrBXIqnYKY/yR02uCSJkRf4t5aW3sOB/RzQF3sPeZcvH3TK","unit":"SAT","account_id":15176,"otpsecret":"GVYHMNCYL5AXMNIK","currency":"CAD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-13T23:55:08.000Z","updatedAt":"2021-05-13T23:55:08.000Z","twofa":null,"pin":null}]}
      this.formatData(test.users, ['username', 'email', 'sms', 'verified', 'createdAt', 'access'])

      try {
        const { data: response } = await Vue.axios.get('/admin/users');
        if (response && response.data) {
          console.log("got: " + JSON.stringify(response.data))
          this.users = response.data.users || []
          this.formatData(this.users, ['username', 'email', 'sms', 'verified', 'createdAt', 'access'])
        } else {
          console.log("No response data: " + + JSON.response.data)
        }
      } catch (e) {
        console.log("Error: " + e.message)
        this.error = 'Error retrieving users'
      }
    },

    async getAccounts () {
      this.resetData()
      console.log('get list of users with account accounts')

      var balanceData = {
        accounts: ['ticker', 'balance', 'createdAt']
      }

      // Test case 
      var test = {"users":[{"subscriptions":null,"id":10385,"locked":false,"verified":null,"fiat":true,"index":0,"ip":3232235781,"seed":"U2FsdGVkX18Zr7W7NYXfykWSN/Je+NEYzSqj0Rrer9aBR2iAccO1fKsTW7bl/6xw3aK8wEAmAPYLvksheskpik7SNHRsQbmfTPfLplzcD5TR1p1PLBd++qRlS2egC5zR","username":"bob","password":"$2b$04$kr/k0tVH5Aztk5eEOAiGEO.DhyG8NkcqieCQUYOeoUm66.ft4p88K","unit":"BTC","account_id":15174,"otpsecret":"KFVEU7JZCAGU6ZZQ","currency":"USD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-11T04:03:34.000Z","updatedAt":"2021-05-15T18:24:57.000Z","twofa":null,"pin":null,"accounts":[{"contract":null,"id":15174,"user_id":10385,"createdAt":"2021-05-11T04:03:34.000Z","updatedAt":"2021-05-11T12:56:04.000Z","path":null,"seed":null,"network":null,"name":"Bitcoin","domain":null,"ticker":"BTC","asset":"5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225","balance":99999950,"pending":0,"hide":null,"index":0,"privkey":null,"pubkey":null,"precision":8}]},{"subscriptions":null,"id":10386,"locked":false,"verified":null,"fiat":false,"index":0,"ip":3232235781,"seed":"U2FsdGVkX19rUB71XeC+GfzMhfzzxrhJhGbsXrRED7VqmDPVAPBNIGvgSTb5m9OAhMBlUxL+FObg9zmoqlMtYpRZMk1JUc81pUVMfY5S27jdw72wWBzdnwlNam5Q/Njx","username":"satoshi-7f77e652","password":"$2b$04$hxE.eJk/PqiHYBkFIHWGUu5FYjdxA1RFhbLdZjJdDN3N4/DNt3TFK","unit":"SAT","account_id":15175,"otpsecret":"KBRAAPI6LBWFIXAA","currency":"CAD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-11T12:56:57.000Z","updatedAt":"2021-05-11T12:56:57.000Z","twofa":null,"pin":null,"accounts":[{"contract":null,"id":15175,"user_id":10386,"createdAt":"2021-05-11T12:56:57.000Z","updatedAt":"2021-05-11T12:56:57.000Z","path":null,"seed":null,"network":null,"name":"Bitcoin","domain":null,"ticker":"BTC","asset":"5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225","balance":0,"pending":0,"hide":null,"index":0,"privkey":null,"pubkey":null,"precision":8}]},{"subscriptions":null,"id":10387,"locked":false,"verified":null,"fiat":false,"index":0,"ip":3232235781,"seed":"U2FsdGVkX1+RaoXfP/0Y3PbTvenpoNbJtIoXWJP6kHsNTZkRQNOKSPCQLng/V3ikaZJc220U+aw2JRcvmaQ/svFgHd+Hz849tdLpgBwxq8QFjWA+rHQ+/vZKW7Q73d4Y","username":"satoshi-499dae2b","password":"$2b$04$CT2PESDrBXIqnYKY/yR02uCSJkRf4t5aW3sOB/RzQF3sPeZcvH3TK","unit":"SAT","account_id":15176,"otpsecret":"GVYHMNCYL5AXMNIK","currency":"CAD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-13T23:55:08.000Z","updatedAt":"2021-05-13T23:55:08.000Z","twofa":null,"pin":null,"accounts":[{"contract":null,"id":15176,"user_id":10387,"createdAt":"2021-05-13T23:55:08.000Z","updatedAt":"2021-05-13T23:55:08.000Z","path":null,"seed":null,"network":null,"name":"Bitcoin","domain":null,"ticker":"BTC","asset":"5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225","balance":0,"pending":0,"hide":null,"index":0,"privkey":null,"pubkey":null,"precision":8}]}]}
      this.formatData(test.users, ['username', 'email'], balanceData)

      try {
        const { data: response } = await Vue.axios.get('/admin/user_accounts');
        if (response && response.data) {
          console.log("got: " + JSON.stringify(response.data))
          this.formatData(response.data.users, ['username', 'email'], balanceData)
        } else {
          console.log("No response data: " + + JSON.response.data)
        }
      } catch (e) {
        console.log("Error: " + e.message)
        this.error = 'Error retrieving users'
      }
    },
    getReferrals () {
      console.log('get referrals via admin api ...')
      this.resetData()

      // Test case 
      var test = {"referrals":[{"id":8,"sponsor_id":1,"user_id":null,"expiry":null,"status":"pending","created_at":"2021-05-15T02:34:16.000Z","updated_at":"2021-05-15T02:34:16.000Z"},{"id":9,"sponsor_id":1,"user_id":null,"expiry":null,"status":"pending","created_at":"2021-05-15T18:35:51.000Z","updated_at":"2021-05-15T18:35:51.000Z"}]}
      this.formatData(test.referrals, ['sponsor_id', 'created_at', 'status', 'token'])
      
      Vue.axios
        .get('/admin/referrals')
        .then( response => {
          this.referrals = response.data.referrals || []
          this.formatData(this.referrals, ['sponsor_id', 'created_at', 'status', 'token'])
          this.message = 'retrieved referrals'
        })
        .catch( err => {
          this.error = 'Error retrieving referrals'
        })
    },
    
    formatData (data, show, subset) {
      this.showHeaders = []

      for (var i = 0; i < show.length; i++) {
        var field = {text: show[i], value: show[i]}
        console.log('add to headers: ' + JSON.stringify(field))
        this.$set(this.showHeaders, this.showHeaders.length, field)

      }
      if (subset) {
        // Add attributes for sub objects if applicable 
        var subsets = Object.keys(subset)
        for (var j = 0; j < subsets.length; j++) {
          var alsoShow = subset[subsets[j]]
          var countfield = subsets[j] + '_count'
          this.$set(this.showHeaders, this.showHeaders.length, {text: countfield, value: countfield})
          for (var k = 0; k < alsoShow.length; k++) {
            this.$set(this.showHeaders, this.showHeaders.length, {text: alsoShow[k], value: alsoShow[k]})
          }
        }
      }
        
      console.log('Initial Headers: ' + JSON.stringify(this.showHeaders))

      this.showData = data.map(a => {
        var record = {}
        for (var i = 0; i < show.length; i++) {
          record[show[i]] = a[show[i]]
          console.log('Set ' + show[i] + ' to ' + a[show[i]])
        }

        console.log('Initial Record: ' + JSON.stringify(record))

        if (subset) {
          // Add attributes for sub objects if applicable 
          var subsets = Object.keys(subset)
          for (var j = 0; j < subsets.length; j++) {
            var alsoShow = subset[subsets[j]]
            console.log(subsets[j] + ': also show: ' + JSON.stringify(alsoShow))

            var countfield = subsets[j] + '_count'
            record[countfield] = a[subsets[j]].length
            console.log("HEADERS: " + JSON.stringify(this.showHeaders))
            
            console.log(subsets[j] + ' Record count: ' + JSON.stringify(record))
            console.log(a[subsets[j]].length)

            for (var k = 0; k < alsoShow.length; k++) {
              if (a[subsets[j]].constructor === Array) {
                var combine = []
                for (var l = 0; l < a[subsets[j]].length; l++) {
                  combine.push(a[subsets[j]][l][alsoShow[k]].toString() || '')
                  console.log('add ' + JSON.stringify(a[subsets[j]][l]))
                  console.log('= ' + JSON.stringify(a[subsets[j]][l][alsoShow[k]]))
                }
                record[alsoShow[k]] = combine.join(' + ')
                console.log('subrecord: ' + JSON.stringify(combine))
                console.log('combined to ' + JSON.stringify(record))
              } else {
                record[alsoShow[k]] = a[subsets[j]][alsoShow[k]]
              }
            }
          }
        }
        return record
      })
    },
    // formatHeaders (data) {
    //   var keys = Object.keys(data)
    //   var headers = []
    //   for (var i = 0; i < keys.length; i++) {
    //     headers.push({text: keys[i], value: keys[i]})
    //   }
    //   return headers
    // }
  }
};
</script>
