<template>
  <v-dialog v-model="swapping" width="500" @click:outside="close">
    <v-card>
      <v-card-title class="headline" primary-title>
        Atomic Swap Proposal
      </v-card-title>

      <v-progress-linear v-if="loading" indeterminate />
      <v-card-text v-else>
        <p>
          To execute the proposed trade using the
          <a href="https://docs.blockstream.com/liquid/swap_tool.html"
            >liquid swap tool</a
          >, 
          download the proposal, accept it, and paste the resulting partially signed transaction below to be
          finalized.
        </p>
        <div class="d-flex flex-wrap mb-2">
          <div class="d-flex flex-grow-1 mb-2">
            <v-btn @click="download(proposal)" class="flex-grow-1 mr-1">
              <v-icon left>$download</v-icon><span>Download</span>
            </v-btn>
            <v-btn @click="copy(proposal)" class="flex-grow-1">
              <v-icon left>$copy</v-icon><span>Copy</span>
            </v-btn>
          </div>
        </div>
        <v-textarea
          label="Base64 Encoded Acceptance Transaction"
          v-model="acceptance"
          auto-focus
          ref="acceptance"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="close">
          <v-icon left color="red">$cancel</v-icon>
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="submit" color="primary" text>
          Ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { get, call, sync } from 'vuex-pathify';
import Copy from '../mixins/Copy';

export default {
  props: {
    params: { type: Object },
    swapping: { type: Boolean },
  },

  mixins: [Copy],

  data: () => ({
    acceptance: '',
    loading: false,
    error: null,
    proposal: null,
  }),

  methods: {
    propose: call('propose'),
    async submit() {
      this.loading = true;
      try {
        await this.accept({ text: this.acceptance });
        this.$emit('close');
      } catch (e) {
        this.error = e.message;
      }
      this.loading = false;
    },
    accept: call('accept'),

    download(text) {
      const filename = 'proposal.txt';
      const blob = new Blob([text], {
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
    close() {
      this.$emit('close');
    },
  },

  async mounted() {
    this.loading = true;
    this.proposal = await this.propose(this.params);
    this.loading = false;
    setTimeout(() => this.$refs.acceptance.focus(), 50);
  },
};
</script>
