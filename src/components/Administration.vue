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
            //-   hr
            //- v-container
            //-   v-data-table(v-if='users && users.length' :headers='uHeaders' :items='users')
            //-   b(v-else-if='users') No Users
          v-tab-item(key="Referrals")
            v-row.justify-space-around
              v-btn(@click='getReferrals("")'  color='green') List Referrals
            //- v-data-table(v-if='referrals && referrals.length' :headers='uHeaders' :items='referrals')
          v-tab-item(key="Transactions")
            v-row.justify-space-around
              v-btn(@click='getTransactions("payments")'  color='green') Payments
              v-btn(@click='getTransactions("orders")'  color='green') Orders
              v-btn(@click='getTransactions("deposits")'  color='green') Deposits
              v-btn(@click='getTransactions("withdrawals")'  color='green') Withdrawals
              v-btn(@click='getTransactions("invoices")'  color='green') Invoices
          v-tab-item(key="Summaries")
            v-row.justify-space-around
              //- :disabled='!search'
              v-btn(@click='getTransactions()'  color='green') Transactions 
              v-btn(@click='getKyc()'  color='green' ) KYC Required
            v-alert (Hint: filter on users to avoid slow queries for transactions)

          v-container
              v-row.justify-space-around
                v-col(cols='3' v-if='stringSearch')
                  b Include users:
                v-col(cols='3' v-if='stringSearch')
                  // Radios are invisible (?) ... as are checkboxes ...
                  //- v-radio-group(v-model='sType')
                  //-   v-radio(key='contains' value='contains' label='Containing')
                  //-   v-radio(key='starts_with' value='starts_with' label='Starting with')
                  v-row
                      input(v-model='sType' type='radio' name='sType' id='contains' value='contains' @input='changed=true')
                      label(for='contains') &nbsp; containing
                  v-row
                    input(v-model='sType' type='radio' name='sType' id='starts_with' value='starts_with' @input='changed=true')
                    label(for='starts_with')  &nbsp; starting with
                  v-row
                    input(v-model='sType' type='radio' name='sType' id='matches' value='matches' checked @input='changed=true')
                    label(for='matches')  &nbsp; matching
                v-col(v-if='stringSearch' cols='2')
                  v-text-field(v-model='search' label='Search' @input='changed=true' placeholder='users')
                v-col(cols='2' v-if='timeSearch && !anytime')
                  v-text-field(v-model='days_ago' type='number' size='3' label='In the past:' @input='changed=true')
                v-col(cols='2' v-if='timeSearch')
                  b(v-if='!anytime') {{days_ago}} Days
                  br
                  input(id='anytime' v-model='anytime' type='checkbox' @input='changed=true' @change="days_ago = anytime ? null : 7")
                  label(for='anytime') &nbsp; Anytime
        p
          v-alert.text-center.green--text(v-if='message') {{message}}
          v-alert.text-center.red--text(v-if='error') {{error}}
          v-alert(v-if='changed' color='yellow' light) Click on applicable button above again to regenerate query
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
      sections: ['Users', 'Referrals', 'Transactions', 'Summaries'],
      search: '',
      sType: 'matches',
      contains: false,
      starts_with: false,
      since: '',
      filter: '',
      changed: false,

      tab: '',
      message: '',
      error: '',
      users: null,
      days_ago: 7,
      anytime: false,

      loadingData: false,

      showData: [],
      showHeaders: [],
      uHeaders: [
        {text: 'username', value: 'username'},
        {text: 'email', value: 'email'},
        {text: 'phone', value: 'phone'}
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
        users: ['username', 'email', 'phone', 'verified', 'created_at', 'access'],
        accounts: ['username', 'email', 'account_id', 'ticker', 'balance', 'created', 'updated'],
        queue: ['email', 'phone', 'requested', 'current_user_id'],
        referrals: ['sponsor', 'token', 'user', 'status', 'created_at'],
  
        transactions: ['username', 'invoices', 'orders', 'deposits', 'withdrawals', 'payments'],
        invoices: ['username', 'email', 'currency', 'amount', 'network'],
        orders: ['seller', 'buyer', 'sell_amount', 'from', 'to', 'buy_amount', 'rate', 'completed'],
        deposits: ['username', 'email', 'amount', 'credited', 'deposited'],
        withdrawals: ['username', 'email', 'amount', 'notes', 'withdrawn'],
        payments: ['username', 'email', 'amount', 'network', 'hash', 'deposited'],

        'kyc flagged users': ['username', 'email', 'max', 'kyc_verified', 'last_changed'], // , 'currency', 'network'
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
        payments: ['username', 'email', 'deposited'],

        'kyc flagged users': ['username', 'email', 'max', 'kyc_verified', 'last_changed'], // 'currency', 'network'
      }
    }
  },
  mixins: [
    CustomSequelize,
    DynamicLoad
  ],
  computed: {
    user: get('user'),
    stringSearch () {
      return this.tab === 0 || this.tab === 2 || this.tab === 3
    },
    timeSearch () {
      return this.tab === 0 || this.tab === 1 || this.tab === 2 || this.tab === 3
    }
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
      this.since = ''
      this.filter = ''
      this.when = ''
      this.changed = false
      if (reset) { this.loadingData = true }

    },
    addSearch (url, scope) {

      if (this.search && this.stringSearch) {
        console.log('including search string: ' + this.search)
        url = url + 'search=' + this.search
        if (this.sType === 'contains') {
          url = url + '&contains=1'
          this.filter = ' containing "' + this.search + '"'
        } else if (this.sType === 'starts_with') {
          url = url + '&starts_with=1'
          this.filter = ' starting with "' + this.search + '"'
        } else {
          this.filter = ' like: "' + this.search + '"'
        }
      }

      if (this.timeSearch && this.days_ago) {
        const since = new Date(new Date() - this.days_ago*24*60*60*1000).toISOString().substring(0,10) // does not account for GMT for now...
        console.log('since = ' + since)
        this.when = ' since ' + since
        url = url + '&since=' + since
      }

      if (scope !== 'users' && this.filter) { this.filter = ' for users' + this.filter }

      return url
    },
    async getUsers () {
      this.resetData(1)
      console.log('Get list of users via admin api ...')

      var url = this.addSearch('/admin/users?', 'users')

      // Test case 
      // var test = {"users":[{"subscriptions":null,"id":10385,"locked":false,"verified":null,"fiat":true,"index":0,"ip":3232235781,"seed":"U2FsdGVkX18Zr7W7NYXfykWSN/Je+NEYzSqj0Rrer9aBR2iAccO1fKsTW7bl/6xw3aK8wEAmAPYLvksheskpik7SNHRsQbmfTPfLplzcD5TR1p1PLBd++qRlS2egC5zR","username":"bob","password":"$2b$04$kr/k0tVH5Aztk5eEOAiGEO.DhyG8NkcqieCQUYOeoUm66.ft4p88K","unit":"BTC","account_id":15174,"otpsecret":"KFVEU7JZCAGU6ZZQ","currency":"USD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-11T04:03:34.000Z","updatedAt":"2021-05-15T18:24:57.000Z","twofa":null,"pin":null},{"subscriptions":null,"id":10386,"locked":false,"verified":null,"fiat":false,"index":0,"ip":3232235781,"seed":"U2FsdGVkX19rUB71XeC+GfzMhfzzxrhJhGbsXrRED7VqmDPVAPBNIGvgSTb5m9OAhMBlUxL+FObg9zmoqlMtYpRZMk1JUc81pUVMfY5S27jdw72wWBzdnwlNam5Q/Njx","username":"satoshi-7f77e652","password":"$2b$04$hxE.eJk/PqiHYBkFIHWGUu5FYjdxA1RFhbLdZjJdDN3N4/DNt3TFK","unit":"SAT","account_id":15175,"otpsecret":"KBRAAPI6LBWFIXAA","currency":"CAD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-11T12:56:57.000Z","updatedAt":"2021-05-11T12:56:57.000Z","twofa":null,"pin":null},{"subscriptions":null,"id":10387,"locked":false,"verified":null,"fiat":false,"index":0,"ip":3232235781,"seed":"U2FsdGVkX1+RaoXfP/0Y3PbTvenpoNbJtIoXWJP6kHsNTZkRQNOKSPCQLng/V3ikaZJc220U+aw2JRcvmaQ/svFgHd+Hz849tdLpgBwxq8QFjWA+rHQ+/vZKW7Q73d4Y","username":"satoshi-499dae2b","password":"$2b$04$CT2PESDrBXIqnYKY/yR02uCSJkRf4t5aW3sOB/RzQF3sPeZcvH3TK","unit":"SAT","account_id":15176,"otpsecret":"GVYHMNCYL5AXMNIK","currency":"CAD","currencies":"[\"CAD\",\"USD\"]","createdAt":"2021-05-13T23:55:08.000Z","updatedAt":"2021-05-13T23:55:08.000Z","twofa":null,"pin":null}]}
      // this.formatData(test.users, ['username', 'email', 'phone', 'verified', 'createdAt', 'access'])

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

      if (!type) { 
        type = 'transactions'
      }
      var url = this.addSearch('/admin/' + type + '?')
      console.log('get list of user ' + type)

      console.log('url: ' + url)
      Vue.axios
        .get(url)
        .then( response => {
          console.log("Response: " + JSON.stringify(response))
          if (response && response.data) {
            this.formatData(response.data[type], type)
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

      var url = this.addSearch('/admin/accounts?nonZero=true&')
      
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

      var url = this.addSearch('/admin/waiting_list?')

      Vue.axios
        .get(url)
        .then( response => {
          console.log('Response: ' + JSON.stringify(response))
          this.queued = response.data.queue || []
          this.formatData(this.queued, 'queue')
          console.log('Queue: ' + JSON.stringify(this.queued))
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
          this.message = this.message + ' (' + status + ')'
        })
        .catch( err => {
          this.error = 'Error retrieving referrals'
        })
    },
    
    async getKyc () {
      console.log('get kyc payments via admin api ...')
      this.resetData(1)

      var url = this.addSearch('/admin/kyc_required?')

      Vue.axios
        .get(url)
        .then( response => {
          console.log('Response: ' + JSON.stringify(response))
          this.kycTransactions = response.data.found || []
          this.formatData(this.kycTransactions, 'kyc flagged users')
          console.log('KYC Transactions: ' + JSON.stringify(this.kycTransactions))
          this.message = this.message + ' (max > 2.1M SAT)'
        })
        .catch( err => {
          this.error = 'Error retrieving kyc transactions'
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
          console.log('filter: ' + this.filter +  '; scope: ' + scope)
          this.message = this.filter ? data.length + ' ' + scope + this.filter : data.length + ' ' + scope
          console.log(this.message)
        } else {
          console.log('empty dataset')
          this.message = this.filter ? 'No ' + scope + this.filter : 'No ' + scope
        }
        if (this.when) { this.message = this.message + this.when }
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
