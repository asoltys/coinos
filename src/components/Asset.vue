<template>
  <v-card class="pa-4" style="background: #333">
    <h1>Issue Asset</h1>
    <v-alert
      v-if="success"
      class="mb-4"
      color="success"
      icon="info"
      v-model="success"
      dismissible
      transition="scale-transition"
      dark
    >
      Settings saved successfully
    </v-alert>
    <v-form @submit.prevent="submit">
      <v-text-field
        label="# of Asset Tokens"
        v-model="asset.asset_amount"
        rows="1"
        auto-grow
      />
      <v-text-field
        label="# of Reissuance Tokens"
        v-model="asset.token_amount"
        rows="1"
        auto-grow
      />
      <v-text-field
        label="Asset Name"
        v-model="asset.name"
        rows="1"
        auto-grow
      />
      <v-text-field label="Ticker" v-model="asset.ticker" rows="1" auto-grow />
      <v-text-field
        label="Precision"
        v-model="asset.precision"
        type="number"
        @input="e => limit(e)"
      />
      <div class="text-right">
        <v-btn type="submit">
          <v-icon left class="yellow--text">send</v-icon>
          <span>Go</span>
        </v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script>
import { call } from 'vuex-pathify';
import Copy from '../mixins/Copy';

export default {
  mixins: [Copy],

  data() {
    return {
      success: false,
      asset: {
        name: '',
        ticker: '',
        precision: 8,
        asset_amount: 100,
        token_amount: 0,
        domain: '',
      },
    };
  },

  methods: {
    issueAsset: call('issueAsset'),
    submit() {
      this.issueAsset(this.asset);
    },
    limit(e) {
      if (e < 0) this.$nextTick(() => (this.asset.precision = 0));
      if (e > 8) this.$nextTick(() => (this.asset.precision = 8));
      this.$nextTick(() => (this.asset.precision = Math.round(e)));
    },
  },
};
</script>
