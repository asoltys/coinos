<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <v-card v-else-if="proposal">
      <v-card-text>
        <v-card color="secondary" class="mb-2">
          <v-card-text>
            <h2 class="text-center white--text">Proposal Created</h2>
            <div class="d-flex">
              <div class="flex-grow-1 text-center">
                <v-icon large @click="showcode = !showcode" class="pa-4"
                  >assignment</v-icon
                >
              </div>
            </div>
          </v-card-text>
        </v-card>
        <v-textarea v-if="showcode" :value="proposal" rows="20" />
        <div v-else class="d-flex mb-2">
          <div class="d-flex flex-grow-1">
            <v-btn v-if="proposal" @click="download" class="flex-grow-1 mr-1">
              <v-icon left>get_app</v-icon><span>Download</span>
            </v-btn>
            <v-btn v-if="proposal" @click="copy(proposal)" class="flex-grow-1">
              <v-icon left>content_copy</v-icon><span>Copy</span>
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <div v-else>
      <div class="d-flex mb-2">
        <v-card class="flex-grow-1 mr-2">
          <v-card-text>
            <v-select label="Asset" v-model="a1" :items="accounts" />
            <amount v-model.number="v1" class="mb-2" />
          </v-card-text>
        </v-card>
        <v-card class="flex-grow-1">
          <v-card-text>
            <v-select label="Asset" v-model="a2" :items="accounts" />
            <amount v-model.number="v2" class="mb-2" />
          </v-card-text>
        </v-card>
      </div>
      <v-btn color="green" @click="submit" class="flex-grow-1">
        <v-icon left>swap_horiz</v-icon><span>Swap</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import Amount from './Amount';
import { get, call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';

const SATS = 100000000;

export default {
  components: { Amount },
  mixins: [Copy],

  data() {
    return {
      loading: false,
      showcode: false,
      a1: 'b2e15d0d7a0c94e4e2ce0fe6e8691b9e451377f6e46e8045a86f7c4b5d4f0f23',
      a2: '85ea9dfb85f6b68ee24d513b79bfca22d4f63be9d1b36af9657759a44c4f4440',
      v1: 6000,
      v2: 8000,
    };
  },

  computed: {
    accounts() {
      return this.user.accounts.map(a => ({ text: a.name, value: a.asset }));
    },

    proposal: sync('proposal'),
    user: get('user'),
  },

  methods: {
    download() {
      const filename = 'proposal.txt';
      const blob = new Blob([this.proposal], {
        type: 'text/plain;charset=utf-8;',
      });
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
      } else {
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    },

    propose: call('propose'),

    async submit() {
      const { a1, a2, v1, v2 } = this;
      this.loading = true;
      await this.propose({ a1, a2, v1, v2 });
      this.loading = false;
    },

    withdraw: call('withdraw'),
  },

  mounted() {
    console.log("mounting");
    this.proposal = null;
  },
};
</script>
