<template lang="pug">
div
  div(v-if='isReferred')
    div(v-show='!openQR')
      v-card
        v-card-title Generate Referral Token(s) for Friends
        v-card-text
          p Each referral token can only be used by one person (send them the token string).
          p They will not need the token to register, but will need it to access funding options. 
          //- p Once this user has opened an account you may be eligible for referral rewards. 
        v-card-actions
          v-row.justify-space-around
            v-btn(@click='generateReferral()', color='green') Generate Raw Token
            v-btn(@click='generateQR()', color='green') Generate QR
            //- v-btn(@click='generateLink()', color='green') Send Email
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
    div(v-show='openQR')
      v-card(style='background-color: #333')
        v-card-title
          b.text-center New QR Referral Link
        v-card-text
          v-alert(color='yellow' light) Any logged in user can scan this barcode to become referred
          v-row.justify-space-around
            canvas#qrCanvas
        v-card-actions
          v-row.justify-space-around
            v-btn(@click='openQR=false' color='green')
              v-icon(large) $cancel
  v-progress-linear(v-else-if='loading' indeterminate='')
  div(v-else)
    v-alert(color='red') Only referred members can refer other friends
  v-dialog(v-model='referral_link' dark max-width='500')
      v-card(style='background-color: #333')
        v-card-title
          b.text-center Live Referral Link
        v-card-text
          v-alert(color='yellow' light) Send this link to someone you know to refer them
          
          v-text-field(v-model='target' placeholder='Email Address')
          v-btn(@click='copyToClipboard("abc")') Copy
          p(v-if='target')
            a(:href='"mailto:" + target + "?subject=CoinOS Referral&body=<a href=" + referral_link + "> Click here to activate your referral </a>"') Link
        v-card-actions
          v-btn(@click='referral_link=null' color='green')
            v-icon(large) $cancel

</template>

<script>
import { call, get } from 'vuex-pathify';
import axios from 'axios';
import Vue from 'vue';
import QRCode from 'qrcode'
import config from '@/config'

import DynamicLoad from '@/mixins/DynamicLoad';

export default {
  props: {},
  mixins: [DynamicLoad],
  data() {
    return {
      referral_url: '',
      referral_link: '',
      target: '',
      tokens: [],
      showTokens: false,
      message: '',
      warning: '',
      showUsed: false,
      status: 'Available',

      newTokenHeaders: [
        { text: 'token', value: 'token' },
        { text: 'status', value: 'status' },
      ],
      allTokenHeaders: [
        {text: 'token', value: 'token'},
        {text: 'status', value: 'status'},
        {text: 'created', value: 'created'},
        {text: 'used_by', value: 'used_by'},
        // {text: 'link', value: 'link'}
        // {text: 'qrcode', value: 'qrcode'}
      ],
      tokenHeaders: [],
      isReferred: false,
      loading: true,
      openQR: false
    };
  },
  computed: {
    user: get('user'),
  },
  async mounted() {
    await this.waitForUser(5);

    if (this.user.admin) {
      this.isReferred = true;
      this.loading = false;
    } else {
      Vue.axios
        .get('/referrals/isReferred/' + this.user.id)
        .then((response) => {
          this.isReferred = response.data.referred;
          this.loading = false;
        })
        .catch((err) => {
          this.isReferred = null;
          console.debug('error checking referral');
          this.loading = false;
        });
    }
  },
  methods: {
    resetMessages() {
      this.warning = '';
      this.message = '';
    },
    generateReferral() {
      const options = {
        sponsor_id: this.user.id,
        expiry: null,
      };

      this.tokens = [];
      this.tokenHeaders = this.newTokenHeaders;

      this.resetMessages()
      return Vue.axios
        // .post('/referrals/grant', options)
        .get('/referrals/grant?sponsor_id=' + this.user.id)
        .then((response) => {
          // console.log("Response: " + JSON.stringify(response))
          if (response.data) {
            const token = response.data;
            this.tokens.push(token);
            this.message = 'Referral token generated...';
            this.status = 'New';
          } else {
            this.warning = 'Error accessing referral token';
          }
        })
        .catch((err) => {
          var now = new Date().toISOString();
          this.warning = 'Error requesting referral token';
        });
    },
    async cancel () {
      
    },
    async generateLink () {
      await this.generateReferral()
      var token = this.status === 'New' ? this.tokens[this.tokens.length-1].token : ''

      console.log('Retrieved ' + token)
      this.referral_link = config.servers[process.env.NODE_ENV] || 'https://coinos.io/funding/referral/' + token
      // send this link in an email message ... 
    },
    async generateQR (version) {
      await this.generateReferral()
      var token = this.status === 'New' ? this.tokens[this.tokens.length-1].token : ''
      
      console.log('Retrieved ' + JSON.stringify(token))

      if (!version) { version = 8 } // sizes range from 1 - 40 indicating size / capacity
      console.log('generate QR..')
      
      var qr = this.referral_url + token

      console.log('link to: ' + JSON.stringify(qr))

      var canvas = document.getElementById('qrCanvas')
      if (canvas) {
        QRCode.toCanvas(canvas, qr, { version: version }, function (error) {
          if (error) console.error(error)
          console.log('success!');
        })
        this.openQR = true

      } else {
        console.log('qr canvas not available')
      }
      this.checkTokens('available')
    },
    checkTokens(status) {
      this.showTokens;
      this.tokens = [];
      this.tokenHeaders = this.allTokenHeaders;
      this.status = status;

      this.resetMessages();
      var url = '/referrals/checkTokens/' + this.user.id;
      if (status) {
        url = url + '?status=' + status;
      } else {
        status = 'all';
      }

      console.log('get tokens for ' + this.user.id);
      console.log(url);
      Vue.axios
        .get(url)
        .then((response) => {
          if (response && response.data) {
            this.tokens = response.data.tokens || [];
          } else {
            this.warning = 'No active referral tokens';
          }
        })
        .catch((err) => {
          this.warning = 'Error retrieving referral tokens';
        });
    }
  },
  watch: {
    user() {
      this.checkTokens('available');
    },
  },
};
</script>
