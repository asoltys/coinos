<template>
  <v-dialog v-model="swapping" width="500" @click:outside="close">
    <v-card>
      <v-card-title class="headline" primary-title>
        Atomic Swap Proposal
      </v-card-title>

      <v-card-text>
        <div class="d-flex flex-wrap mb-2">
          <div class="d-flex flex-grow-1 mb-2">
            <v-btn @click="download(proposal.text)" class="flex-grow-1 mr-1">
              <v-icon left>$download</v-icon><span>Download</span>
            </v-btn>
            <v-btn @click="copy(proposal.text)" class="flex-grow-1">
              <v-icon left>$copy</v-icon><span>Copy</span>
            </v-btn>
          </div>
          <div class="d-flex" style="width: 100%">
            <v-btn @click="accepting = !accepting" class="flex-grow-1">
              <v-icon left color="green">$assignment</v-icon><span>Accept</span>
            </v-btn>
          </div>
          <v-textarea
            v-if="accepting"
            label="Base64 Encoded Acceptance Transaction"
            v-model="acceptance"
          />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="close">
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          @click="accept({ id: proposal.id, text: acceptance })"
          color="primary"
          text
        >
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
    proposal: { type: Object },
    swapping: { type: Boolean },
  },

  mixins: [Copy],

  data() {
    return {
      accepting: false,
      acceptance: '',
    };
  },

  methods: {
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
};
</script>
