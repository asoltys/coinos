<template lang="pug">
div
  v-card
    v-card-title Generate Referral Token(s) for Friends
    v-card-text
      p Note: each referral token can only be used by one person
    v-card-actions
      v-row.justify-space-around
        v-btn(@click='generateReferral()', color='green') Generate Referral Token
        v-btn(@click='checkTokens()', color='green') List Referral Tokens
  hr
  v-card
    v-card-title Referral Token(s)
    v-card-text
      div(v-if='tokens && tokens.length')
        v-data-table(:items='tokens' :headers='tokenHeaders')
      div(v-else) No Tokens Found
      hr
      p(v-if='message') &nbsp;
        b.message() {{ message }}
      p(v-if='warning')
        b.warning {{ warning }}


</template>

<script>
import { call, get } from 'vuex-pathify';
import axios from 'axios';
import Vue from 'vue';

export default {
  props: {},
  data() {
    return {
      tokens: [],
      showTokens: false,
      message: '',
      warning: '',
      showUsed: false,

      newTokenHeaders: [
        {text: 'token', value: 'token'},
        {text: 'status', value: 'status'},
      ],
      allTokenHeaders: [
        {text: 'token', value: 'token'},
        {text: 'status', value: 'status'},
        {text: 'created_at', value: 'created_at'},
        {text: 'used_by', value: 'used_by'},
      ],
      tokenHeaders: []
    };
  },
  computed: {
    user: get('user'),
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
          } else {
            this.warning = 'Error accessing referral token';
          }
        })
        .catch((err) => {
          var now = new Date().toISOString();
          this.warning = 'Error requesting referral token';
        });
    },
    
    checkTokens() {
      this.showTokens;
      this.tokens = [];
      this.tokenHeaders = this.allTokenHeaders

      this.resetMessages()

      Vue.axios
        .get('/referrals/checkTokens/' + this.user.id)
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
};
</script>
