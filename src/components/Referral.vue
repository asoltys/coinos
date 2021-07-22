<template lang="pug">
div
  div(v-if='isReferred')
    v-card
      v-card-title Generate Referral Token(s) for Friends
      v-card-text
        p Each referral token can only be used by one person (send them the token string).
        p They will not need the token to register, but will need it to access funding options. 
        //- p Once this user has opened an account you may be eligible for referral rewards. 
      v-card-actions
        v-row.justify-space-around
          v-btn(@click='generateReferral()', color='green') Generate New Token
          v-btn(@click='checkTokens("available")', color='green') Available
          v-btn(@click='checkTokens("used")', color='green') Used
    hr
    v-card
      v-card-title {{status}} Referral Token(s)
      v-card-text
        div(v-if='tokens && tokens.length')
          //- v-list
          //-   v-list-item(v-for='token in tokens')
          //-     v-list-item-title Token
          //-     v-list-item-content {{token.token}}
          //-     v-list-item-title Created
          //-     v-list-item-content {{token.created_at.substring(0,10)}}
          //-     v-list-item-title Used By
          //-     v-list-item-content {{token.user}}

          v-data-table(:items='tokens' :headers='tokenHeaders')
        div(v-else) No Tokens Found
        hr
        p(v-if='message') &nbsp;
          b.message() {{ message }}
        p(v-if='warning')
          b.warning {{ warning }}
  v-progress-linear(v-else-if='loading' indeterminate='')
  div(v-else)
    v-alert(color='red') Only referred members can refer other friends


</template>

<script>
import { call, get } from 'vuex-pathify';
import axios from 'axios';
import Vue from 'vue';

import DynamicLoad from '@/mixins/DynamicLoad'

export default {
  props: {},
  mixins: [
    DynamicLoad
  ],
  data() {
    return {
      tokens: [],
      showTokens: false,
      message: '',
      warning: '',
      showUsed: false,
      status: 'Available',

      newTokenHeaders: [
        {text: 'token', value: 'token'},
        {text: 'status', value: 'status'},
      ],
      allTokenHeaders: [
        {text: 'token', value: 'token'},
        {text: 'status', value: 'status'},
        {text: 'created', value: 'created'},
        {text: 'used_by', value: 'used_by'},
      ],
      tokenHeaders: [],
      isReferred: false,
      loading: true
    };
  },
  computed: {
    user: get('user'),
  },
  async mounted () {
    await this.waitForUser(5)

    console.log('check referral status for ' + this.user.id)
    Vue.axios.get('/referrals/isReferred/' + this.user.id)
      .then( response => {
        this.isReferred = response.data.referred
        console.log('referred: ' + this.isReferred)
        this.loading = false
      })
      .catch( err => {
        this.isReferred = null
        console.debug('error checking referral')
        this.loading = false
      })
  },
  methods: {
    resetMessages () {
      this.warning = ''
      this.message = ''
    },
    generateReferral () {
      const options = {
        sponsor_id: this.user.id,
        expiry: null,
      };

      this.tokens = []
      this.tokenHeaders = this.newTokenHeaders

      this.resetMessages()
      Vue.axios
        // .post('/referrals/grant', options)
        .get('/referrals/grant?sponsor_id=' + this.user.id)
        .then((response) => {
          console.log("Response: " + JSON.stringify(response))
          if (response.data) {
            const token = response.data;
            this.tokens.push(token);
            this.message = 'Referral token generated...';
            this.status = 'New'
          } else {
            this.warning = 'Error accessing referral token';
          }
        })
        .catch((err) => {
          var now = new Date().toISOString();
          this.warning = 'Error requesting referral token';
        });
    },
    
    checkTokens(status) {
      this.showTokens;
      this.tokens = [];
      this.tokenHeaders = this.allTokenHeaders
      this.status = status

      this.resetMessages()
      var url = '/referrals/checkTokens/' + this.user.id
      if (status) { url = url + '?status=' + status }
      else { status = 'all' }

      console.log('get tokens for ' + this.user.id)
      console.log(url)
      Vue.axios
        .get(url)
        .then((response) => {
          if (response && response.data) {
            console.log("Response: " + JSON.stringify(response.data))
            var tokens = response.data.tokens || [];
            for (var i = 0; i < tokens.length; i++) {
              console.log(i + ' / ' + tokens.length)
              if (tokens[i].user) {
                this.$set(tokens[i], 'used_by', tokens[i].user.username)
              }
            }
            this.tokens = tokens
          } else {
            this.warning = 'No active referral tokens';
          }
        })
        .catch((err) => {
          this.warning = 'Error retrieving referral tokens';
        });
    },
  },
  watch: {
    user () {
      this.checkTokens('available')
    }
  }
};
</script>
