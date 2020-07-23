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
        <v-textarea v-if="showcode" :value="proposal.text" rows="20" />
        <div class="d-flex flex-wrap mb-2">
          <div class="d-flex flex-grow-1 mb-2">
            <v-btn @click="download" class="flex-grow-1 mr-1">
              <v-icon left>get_app</v-icon><span>Download</span>
            </v-btn>
            <v-btn @click="copy(proposal.text)" class="flex-grow-1">
              <v-icon left>content_copy</v-icon><span>Copy</span>
            </v-btn>
          </div>
          <div class="d-flex flex-grow-1" style="width: 100%">
            <v-btn
              @click="publish"
              color="yellow"
              class="black--text flex-grow-1"
            >
              <v-icon left>assignment</v-icon><span>Publish</span>
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <div v-else>
      <div class="d-flex mb-2">
        <v-card class="flex-grow-1 mr-2">
          <v-card-text>
            <h2 class="text-center">Trade</h2>
            <v-select label="Asset" v-model="a1" :items="accounts" />
            <amount
              v-model.number="v1"
              class="mb-2"
              :currency="a1c"
              :key="a1c"
            />
          </v-card-text>
        </v-card>
        <v-card class="flex-grow-1">
          <v-card-text>
            <h2 class="text-center">For</h2>
            <v-select label="Asset" v-model="a2" :items="accounts" />
            <amount
              v-model.number="v2"
              class="mb-2"
              :currency="a2c"
              :key="a2c"
            />
          </v-card-text>
        </v-card>
      </div>
      <div class="d-flex">
        <v-btn color="green" @click="submit" class="flex-grow-1">
          <v-icon left>assignment</v-icon><span>Generate Proposal</span>
        </v-btn>
      </div>
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
    a1c() {
      return this.user.accounts.find(a => a.asset === this.a1).ticker;
    },
    a2c() {
      return this.user.accounts.find(a => a.asset === this.a2).ticker;
    },
    accounts() {
      return this.user.accounts.map(a => ({ text: a.name, value: a.asset }));
    },

    proposal: sync('proposal'),
    user: get('user'),
  },

  methods: {
    publish: call('publish'),
    download() {
      const filename = 'proposal.txt';
      const blob = new Blob([this.proposal.text], {
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
    this.proposal = null;
  },
};
</script>
