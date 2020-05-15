<template>
  <div>
    <v-textarea
      class="my-4"
      label="Address or Invoice:"
      dark
      v-model="to"
      clearable
      auto-grow
      rows="1"
      hide-details
      @input="() => handleScan(to)"
      ref="to"
      :error="to.length > 0"
    >
      <template v-if="to.length" v-slot:append>
        <v-btn icon @click="() => showText(to)" class="ml-1" text>
          <qrcode />
        </v-btn>
        <v-btn @click="() => copy(to)" class="ml-1" icon>
          <v-icon class="mr-1">content_copy</v-icon>
        </v-btn>
      </template>
    </v-textarea>
    <v-chip v-if="to.length > 0" class="black--text mb-2" color="white">
      <v-icon color="black" left>warning</v-icon>
      Can't parse address or payment request
    </v-chip>
    <div class="d-flex flex-wrap">
      <v-btn v-if="canPaste" class="mr-2 mb-2 flex-grow-1" @click="paste">
        <v-icon class="mr-1">assignment</v-icon>
        <span>Paste</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { call } from 'vuex-pathify';
import Copy from '../mixins/Copy';
import Qrcode from 'vue-material-design-icons/Qrcode';

export default {
  components: { Qrcode },
  mixins: [Copy],
  data() {
    return {
      to: '',
    };
  },
  computed: {
    canPaste: () => navigator.clipboard,
  },
  methods: {
    handleScan: call('handleScan'),
    showText: call('showText'),
    async paste() {
      this.to = await navigator.clipboard.readText();
      this.handleScan(this.to);
    },
  },
  mounted() {
    const vw = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    if (vw > 600 && this.$refs.to) this.$refs.to.focus();
  } 
} 
</script>
