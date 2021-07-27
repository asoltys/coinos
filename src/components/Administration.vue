<template lang='pug'>
  div
    v-progress-linear(v-if='!waitedForUser' indeterminate='')
    div(v-show='user && user.admin')
      v-tabs(v-model='tab' dark)
        v-tab(v-for='section in sections' :key='section' @click="resetData()") {{section}}
      v-container
        v-tabs-items(v-model="tab")
          v-tab-item(key="Users")
            v-row.justify-space-around
              v-btn(@click='getUsers()' color='green') List Users
              v-btn(@click='getQueue()'  color='green') Waiting List
              v-btn(@click='getAccounts()' color='green') Accounts with Balance
            p
            v-container()
              v-row.justify-space-around
                v-col(cols='4')
                  b Include names/emails:
                v-col(cols='4')
                  // Radios are invisible (?) ... as are checkboxes ...
                  //- v-radio-group(v-model='sType')
                  //-   v-radio(key='contains' value='contains' label='Containing')
                  //-   v-radio(key='starts_with' value='starts_with' label='Starting with')
                  v-row
                      input(v-model='sType' type='radio' name='sType' id='contains' value='contains')
                      label(for='contains') &nbsp; containing
                  v-row
                    input(v-model='sType' type='radio' name='sType' id='starts_with' value='starts_with')
                    label(for='starts_with')  &nbsp; starting with
                  v-row
                    input(v-model='sType' type='radio' name='sType' id='matches' value='matches' checked)
                    label(for='matches')  &nbsp; matching

                v-col(cols='4')
                  v-text-field(v-model='search' label='Search string')
            //-   hr
            //- v-container
            //-   v-data-table(v-if='users && users.length' :headers='uHeaders' :items='users')
            //-   b(v-else-if='users') No Users
          v-tab-item(key="Referrals")
            v-row.justify-space-around
              v-btn(@click='getReferrals("")'  color='green') List Referrals
            //- v-data-table(v-if='referrals && referrals.length' :headers='uHeaders' :items='referrals')
          v-tab-item(key="Stats")
            v-row.justify-space-around
              v-btn(@click='getTransactions("payments")'  color='green') Payments
              v-btn(@click='getTransactions("orders")'  color='green') Orders
              v-btn(@click='getTransactions("deposits")'  color='green') Deposits
              v-btn(@click='getTransactions("withdrawals")'  color='green') Withdrawals
              v-btn(@click='getTransactions("invoices")'  color='green') Invoices
              v-btn(@click='getTransactions()' color='green') Summary
            v-row.justify-left.align-center
              v-col(cols='4')
                v-text-field(v-model='days_ago' type='number' size='5' label='In the past:')
              v-col(cols='8') Days
        p
          v-alert.text-center.green--text(v-if='message') {{message}}
          v-alert.text-center.red--text(v-if='error') {{error}}
        p
          hr
        v-container
          v-alert(v-if='loadingData') loading Data ...
          v-data-table(v-if='showData && showData.length' :headers='showHeaders' :items='showData' :footer-props="footer" :sort-by='sort')
          
    div(v-show='waitedForUser && !user.admin') 
      v-alert(color='red') Access Denied
      v-alert() Administrator access only 
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
import Vue from 'vue';

import CustomSequelize from '@/mixins/CustomSequelize'
import DynamicLoad from '@/mixins/DynamicLoad'

export default {
  data() {
    return {
      sections: ['Users', 'Referrals', 'Stats'],
      search: '',
      sType: 'matches',
      contains: false,
      starts_with: false,

      tab: '',
      message: '',
      error: '',
      users: null,
      days_ago: 7,

      loadingData: false,

      showData: [],
      showHeaders: [],
      uHeaders: [
        {text: 'username', value: 'username'},
        {text: 'email', value: 'email'},
        {text: 'sms', value: 'sms'}
      ],

      referrals: null,
      queued: null,
      rHeaders: [
        {text: 'sponsor_id', value: 'sponsor_id'},
        {text: 'token', value: 'token'},
        {text: 'status', value: 'status'}
      ],

      reference: {},

      footer: {
        showFirstLastPage: true,
        firstIcon: '$page_first',
        lastIcon: '$page_last',
        prevIcon: '$previous',
        nextIcon: '$next'
      },
      showFields: {
        users: ['username', 'email', 'sms', 'verified', 'created_at', 'access'],
        accounts: ['username', 'email', 'account_id', 'ticker', 'balance', 'created', 'updated'],
        queue: ['email', 'sms', 'requested', 'current_user_id'],
        referrals: ['sponsor', 'token', 'user', 'status', 'created_at'],

        transactions: ['username', 'invoices', 'orders', 'deposits', 'withdrawals', 'payments'],
        invoices: ['username', 'email', 'currency', 'amount', 'network'],
        orders: ['seller', 'buyer', 'sell_amount', 'from', 'to', 'buy_amount', 'rate', 'completed'],
        deposits: ['username', 'email', 'amount', 'credited', 'deposited'],
        withdrawals: ['username', 'email', 'amount', 'notes', 'withdrawn'],
        payments: ['username', 'email', 'amount', 'network', 'hash', 'deposited']
      },
      sortFields: {
        users: ['username', 'email', 'created_at', 'access'],
        accounts: ['username', 'email', 'account_id', 'created', 'updated'],
        queue: ['email', 'requested'],
        referrals: ['sponsor', 'user', 'created_at'],

        transactions: ['username'],
        invoices: ['username', 'email'],
        orders: ['seller', 'buyer', 'completed'],
        deposits: ['username', 'email', 'deposited'],
        withdrawals: ['username', 'email', 'withdrawn'],
        payments: ['username', 'email', 'deposited']
      }
    }
  },
  mixins: [
    CustomSequelize,
    DynamicLoad
  ],
  computed: {
    user: get('user'),
  },
  async mounted () {
    await this.waitForUser(5)
  },
  methods: {
    resetData (reset) {
      this.message = ''
      this.error = ''
      this.showData = []
      this.showHeaders = []
      if (reset) { this.loadingData = true }

    },
    async getUsers () {
      this.resetData(1)
      console.log('Get list of users via admin api ...')

      var url = '/admin/users?'

      if (this.search) {
        url = url + 'search=' + this.search
        if (this.sType === 'contains') {
          url = url + '&contains=1'
          this.message = 'user(s) containing "' + this.search + '"'
        } else if (this.sType === 'starts_with') {
          url = url + '&starts_with=1'
          this.message = 'user(s) starting with "' + this.search + '"'
        } else {
          this.message = 'user(s) like: "' + this.search + '"'
        }
      }

      // Test case 
      // var test = {"users":[{"subscriptions":null,"id":10385,"locked":false,"verified":null,"fiat":true,"index":0,"ip":3232235781,"seed":"U2FsdGVkX18Zr7W7NYXfykWSN/Je+NEYzSqj0Rrer9aBR2iAccO1fKsTW7bl/6xw3aK8wEAmAPYLvksheskpik7SNHRsQbmfTPfLplzcD5TR1p1PLBd++qRlS2egC5zR","username":"bob","password":"$2b$04$kr/k0tVH5Aztk5eEOAiGEO.DhyG8NkcqieCQUYOeoUm66.ft4p88K","unit":"BTC","account_id":15174,"otpsecret":"KFVEU7JZCAGU6ZZQ","currency":"USD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-11T04:03:34.000Z","updatedAt":"2021-05-15T18:24:57.000Z","twofa":null,"pin":null},{"subscriptions":null,"id":10386,"locked":false,"verified":null,"fiat":false,"index":0,"ip":3232235781,"seed":"U2FsdGVkX19rUB71XeC+GfzMhfzzxrhJhGbsXrRED7VqmDPVAPBNIGvgSTb5m9OAhMBlUxL+FObg9zmoqlMtYpRZMk1JUc81pUVMfY5S27jdw72wWBzdnwlNam5Q/Njx","username":"satoshi-7f77e652","password":"$2b$04$hxE.eJk/PqiHYBkFIHWGUu5FYjdxA1RFhbLdZjJdDN3N4/DNt3TFK","unit":"SAT","account_id":15175,"otpsecret":"KBRAAPI6LBWFIXAA","currency":"CAD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-11T12:56:57.000Z","updatedAt":"2021-05-11T12:56:57.000Z","twofa":null,"pin":null},{"subscriptions":null,"id":10387,"locked":false,"verified":null,"fiat":false,"index":0,"ip":3232235781,"seed":"U2FsdGVkX1+RaoXfP/0Y3PbTvenpoNbJtIoXWJP6kHsNTZkRQNOKSPCQLng/V3ikaZJc220U+aw2JRcvmaQ/svFgHd+Hz849tdLpgBwxq8QFjWA+rHQ+/vZKW7Q73d4Y","username":"satoshi-499dae2b","password":"$2b$04$CT2PESDrBXIqnYKY/yR02uCSJkRf4t5aW3sOB/RzQF3sPeZcvH3TK","unit":"SAT","account_id":15176,"otpsecret":"GVYHMNCYL5AXMNIK","currency":"CAD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-13T23:55:08.000Z","updatedAt":"2021-05-13T23:55:08.000Z","twofa":null,"pin":null}]}
      // this.formatData(test.users, ['username', 'email', 'sms', 'verified', 'createdAt', 'access'])

      Vue.axios
        .get(url)
        .then( response => {
          console.log("Response: " + JSON.stringify(response))
          if (response && response.data) {
            console.log("got: " + JSON.stringify(response.data))
            this.users = response.data.users || []
            this.formatData(this.users, 'users')
          } else {
            console.log("No response data: " + + JSON.response.data)
          }
        })
        .catch (e => {
          console.log("Error: " + e.message)
          this.error = 'Error retrieving users'
        })
    },

    async getTransactions (type) {
      this.resetData(1)

      if (!type) { type = 'transactions' }

      console.log('get list of user ' + type)

      const since = new Date(new Date() - this.days_ago*24*60*60*1000).toISOString().substring(0,10) // does not account for GMT for now...
      console.log('since = ' + since)

      var url = '/admin/' + type + '?since=' + since
      console.log('url: ' + url)
      Vue.axios
        .get(url)
        .then( response => {
          console.log("Response: " + JSON.stringify(response))
          if (response && response.data) {
            this.formatData(response.data[type], type)
            if (type !== 'transactions') { this.message = response.data[type].length + ' ' + type + ' since ' + since }
          } else {
            console.log("No response data: " + + JSON.stringify(response))
          }
        })
        .catch (e => {
          console.log("Error: " + e.message)
          this.error = 'Error retrieving users'
        })
    },

    async getAccounts () {
      this.resetData(1)
      console.log('get list of users with account balances')

      var url = '/admin/accounts?nonZero=true&'
      if (this.search) {
        url = url + 'search=' + this.search
        if (this.sType === 'contains') {
          url = url + '&contains=1'
          this.message = 'for user(s) containing "' + this.search + '"'
        } else if (this.sType === 'starts_with') {
          url = url + '&starts_with=1'
          this.message = 'for user(s) starting with "' + this.search + '"'
        } else {
          this.message = 'for user(s) like: "' + this.search + '"'
        }
      }
      // var balanceData = {
      //   accounts: ['account_id', 'ticker', 'balance', 'created_at', 'updated_at']
      // }

      // Test case 
      // var test = {"users":[{"subscriptions":null,"id":10385,"locked":false,"verified":null,"fiat":true,"index":0,"ip":3232235781,"seed":"U2FsdGVkX18Zr7W7NYXfykWSN/Je+NEYzSqj0Rrer9aBR2iAccO1fKsTW7bl/6xw3aK8wEAmAPYLvksheskpik7SNHRsQbmfTPfLplzcD5TR1p1PLBd++qRlS2egC5zR","username":"bob","password":"$2b$04$kr/k0tVH5Aztk5eEOAiGEO.DhyG8NkcqieCQUYOeoUm66.ft4p88K","unit":"BTC","account_id":15174,"otpsecret":"KFVEU7JZCAGU6ZZQ","currency":"USD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-11T04:03:34.000Z","updatedAt":"2021-05-15T18:24:57.000Z","twofa":null,"pin":null,"accounts":[{"contract":null,"id":15174,"user_id":10385,"createdAt":"2021-05-11T04:03:34.000Z","updatedAt":"2021-05-11T12:56:04.000Z","path":null,"seed":null,"network":null,"name":"Bitcoin","domain":null,"ticker":"BTC","asset":"5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225","balance":99999950,"pending":0,"hide":null,"index":0,"privkey":null,"pubkey":null,"precision":8}]},{"subscriptions":null,"id":10386,"locked":false,"verified":null,"fiat":false,"index":0,"ip":3232235781,"seed":"U2FsdGVkX19rUB71XeC+GfzMhfzzxrhJhGbsXrRED7VqmDPVAPBNIGvgSTb5m9OAhMBlUxL+FObg9zmoqlMtYpRZMk1JUc81pUVMfY5S27jdw72wWBzdnwlNam5Q/Njx","username":"satoshi-7f77e652","password":"$2b$04$hxE.eJk/PqiHYBkFIHWGUu5FYjdxA1RFhbLdZjJdDN3N4/DNt3TFK","unit":"SAT","account_id":15175,"otpsecret":"KBRAAPI6LBWFIXAA","currency":"CAD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-11T12:56:57.000Z","updatedAt":"2021-05-11T12:56:57.000Z","twofa":null,"pin":null,"accounts":[{"contract":null,"id":15175,"user_id":10386,"createdAt":"2021-05-11T12:56:57.000Z","updatedAt":"2021-05-11T12:56:57.000Z","path":null,"seed":null,"network":null,"name":"Bitcoin","domain":null,"ticker":"BTC","asset":"5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225","balance":0,"pending":0,"hide":null,"index":0,"privkey":null,"pubkey":null,"precision":8}]},{"subscriptions":null,"id":10387,"locked":false,"verified":null,"fiat":false,"index":0,"ip":3232235781,"seed":"U2FsdGVkX1+RaoXfP/0Y3PbTvenpoNbJtIoXWJP6kHsNTZkRQNOKSPCQLng/V3ikaZJc220U+aw2JRcvmaQ/svFgHd+Hz849tdLpgBwxq8QFjWA+rHQ+/vZKW7Q73d4Y","username":"satoshi-499dae2b","password":"$2b$04$CT2PESDrBXIqnYKY/yR02uCSJkRf4t5aW3sOB/RzQF3sPeZcvH3TK","unit":"SAT","account_id":15176,"otpsecret":"GVYHMNCYL5AXMNIK","currency":"CAD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-13T23:55:08.000Z","updatedAt":"2021-05-13T23:55:08.000Z","twofa":null,"pin":null,"accounts":[{"contract":null,"id":15176,"user_id":10387,"createdAt":"2021-05-13T23:55:08.000Z","updatedAt":"2021-05-13T23:55:08.000Z","path":null,"seed":null,"network":null,"name":"Bitcoin","domain":null,"ticker":"BTC","asset":"5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225","balance":0,"pending":0,"hide":null,"index":0,"privkey":null,"pubkey":null,"precision":8}]}]}
      // this.formatData(test.users, ['username', 'email'], balanceData)

      Vue.axios
        .get(url)
        .then( response => {
          console.log("Response: " + JSON.stringify(response))
          if (response && response.data) {
            var accounts = response.data.accounts || []
            this.formatData(accounts, 'accounts')
            this.message = accounts.length + ' Accounts ' + this.message
          } else {
            console.log("No response data: " + + JSON.stringify(response))
          }
        })
        .catch (e => {
          console.log("Error: " + e.message)
          this.error = 'Error retrieving users'
        })
    },
    getQueue () {
      console.log('get waiting list via admin api ...')
      this.resetData(1)

      var url = '/admin/waiting_list?'

      if (this.search) {
        url = url + 'search=' + this.search
        if (this.sType === 'contains') {
          url = url + '&contains=1'
          this.message = 'user(s) containing "' + this.search + '"'
        } else if (this.sType === 'starts_with') {
          url = url + '&starts_with=1'
          this.message = 'user(s) starting with "' + this.search + '"'
        } else {
          this.message = 'user(s) like: "' + this.search + '"'
        }
      }

      Vue.axios
        .get(url)
        .then( response => {
          console.log('Response: ' + JSON.stringify(response))
          this.queued = response.data.queue || []
          this.formatData(this.queued, 'queue')
          console.log('Queue: ' + JSON.stringify(this.queued))
          this.message = this.queued.length + ' ' + this.message + ' on Waiting List'
        })
        .catch( err => {
          this.error = 'Error retrieving waiting list'
        })
    },
    getReferrals (status) {
      console.log('get referrals via admin api ...')
      this.resetData(1)

      var url = '/admin/referrals'
      if (status) { url = url + '?status=' + status }
      else { status = '' }

      Vue.axios
        .get(url)
        .then( response => {
          console.log('Response: ' + JSON.stringify(response))
          this.referrals = response.data.referrals || []
          this.formatData(this.referrals, 'referrals')
          console.log('Referrals: ' + JSON.stringify(this.referrals))
          this.message = 'Retrieved ' + this.referrals.length + ' ' + status + ' Referrals'
        })
        .catch( err => {
          this.error = 'Error retrieving referrals'
        })
    },
    
    formatData (data, scope, subset) {
      this.showHeaders = []
      var show = this.showFields[scope]
      var sort = this.sortFields[scope]

      for (var i = 0; i < show.length; i++) {
        var field = {text: show[i], value: show[i]}
        // console.log('add to headers: ' + JSON.stringify(field))
        this.$set(this.showHeaders, this.showHeaders.length, field)
      }
      
      console.log('Initial Headers: ' + JSON.stringify(this.showHeaders))
      var Nto1 = false // flag if records include 1 to Many attributes`
      var reference    // include references to potential 1:N attributes

      if (subset) { 
        var parsed  = this.parseSequelizeData(data, subset)
        this.showData = parsed.data
        reference = parsed.references
        Nto1 = parsed.Nto1

        console.log('Parsed references: ' + JSON.stringify(reference))
      } else {
        if (data && data.length) {
          this.showData = data.map((a, index) => {
            var record = {}
            for (var i = 0; i < show.length; i++) {
              record[show[i]] = a[show[i]]
            }
            return record
          })
        } else {
          console.log('empty dataset')
          this.showData = []
        }
      }

      if (reference && Nto1) {
        console.log('add tree reference')
        console.log('Extra references: ' + JSON.stringify(reference))
      } else if (reference) {
        console.log('embed extra references')
        console.log('Extra references: ' + JSON.stringify(reference))
        console.log('x ' + data.length)
        for (var x = 0; x < data.length; x++) {
          var addObjects = Object.keys(reference[x])
          for (var o = 0; o < addObjects.length; o++) {
            var addFields = Object.keys(reference[x][addObjects[o]][0])
            for (var f = 0; f < addFields.length; f++) {
              this.showData[x][addFields[f]] = reference[x][addObjects[o]][0][addFields[f]]
              if (x < 1) {              
                this.$set(this.showHeaders, this.showHeaders.length, {text: addFields[f], value: addFields[f]})
              }
            }
          }
        }
      }
      this.sort = sort
      this.loadingData = false
    }
  }
};
</script>
