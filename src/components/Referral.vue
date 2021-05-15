<template lang="pug">
div
  v-card
    v-card-title Generate Referral Token(s) for Friends
    v-card-text
      p Note: each referral token can only be used by one person
    v-card-actions
      v-btn(@click='generateReferral()', color='green') Generate Referral Token
      v-btn(@click='checkTokens()', color='green') Check Available Tokens
  hr
  v-card
    v-card-title Referral Token(s)
    v-card-text
      div(v-if='tokens && tokens.length')
        ol
          li(v-for='token in tokens', v-if='(token.status = "pending")')
            b {{ token.token }} &nbsp; &nbsp;
            span(v-if='token.expiry') (expires: {{ token.expiry }})
      div(v-else) No Tokens Found
      hr
      div(v-if='showTokens')
        v-btn(@click='showUsed = true', color='green', small) Show Used Tokens
        div(v-if='showUsed')
          p Unavailable tokens:
          ol
            li(v-for='token in tokens', v-if='token.status != "pending"')
              b {{ token.token }} [{{ token.status }}]
              span(v-if='token.expiry') (expiration: {{ token.expiry }})
        v-btn(@click='showUsed = true')
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
    };
  },
  computed: {
    user: get('user'),
  },
  methods: {
    generateReferral () {
      const options = {
        sponsor_id: this.user.id,
        expiry: null,
      };

      Vue.axios
        .post('/referrals/grant', options)
        .then((response) => {
          console.log("Response: " + JSON.stringify(response))
          if (response.token) {
            const token = response.token;
            this.tokens.push(token);
            this.warning = 'Referral token generated...';
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
      this.message = '';
      this.warning = '';
      Vue.axios
        .get('/referrals/checkTokens/' + this.user.id)
        .then((response) => {
          if (response) {
            console.log("Response: " + JSON.stringify(response))
            this.tokens = response.tokens || [];
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
