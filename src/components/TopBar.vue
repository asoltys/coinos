<template>
  <v-app-bar absolute app dark color="black" fixed>
    <v-toolbar-title
      dark
      @click="goHome"
      class="display-2"
      style="cursor: pointer"
      >coin<span class="yellow--text">os</span></v-toolbar-title
    >
    <v-spacer></v-spacer>
    <v-menu class="mx-2" v-if="user && user.name && user.accounts.length" offset-y nudge-bottom="1">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" class="mx-2">
          <v-icon>account_balance_wallet</v-icon>
          <span class="truncate">{{ asset }}</span>
        </v-btn>
      </template>
      <v-card tile class="mx-auto menu" max-width="400">
        <v-list-item v-for="a in accounts" :key="a" @click="asset = a">
          <v-list-item-content><span class="truncate">{{ a }}</span></v-list-item-content>
        </v-list-item>
      </v-card>
    </v-menu>
    <v-menu class="ml-2" v-if="user && user.name" offset-y nudge-bottom="1">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on">
          <v-avatar class="mr-2" v-if="user.pic" size="30">
            <img :src="user.pic" />
          </v-avatar>
          <v-icon v-else>person</v-icon>
          <span class="truncate">{{
            user.fbtoken ? user.name : user.username
          }}</span>
        </v-btn>
      </template>
      <v-card tile class="mx-auto menu" max-width="400">
        <v-list-item @click="$go('/about')">
          <v-list-item-action>
            <v-icon>help</v-icon>
          </v-list-item-action>
          <v-list-item-content>About</v-list-item-content>
        </v-list-item>
        <v-list-item @click="$go('/settings')">
          <v-list-item-action>
            <v-icon>settings</v-icon>
          </v-list-item-action>
          <v-list-item-content>Settings</v-list-item-content>
        </v-list-item>
        <v-list-item @click="$go('/logout')">
          <v-list-item-action>
            <power-settings-icon title="Logout" />
          </v-list-item-action>
          <v-list-item-content>Logout</v-list-item-content>
        </v-list-item>
      </v-card>
    </v-menu>
    <v-btn icon v-else @click="$go('/about')">
      <v-icon>help</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import PowerSettingsIcon from 'vue-material-design-icons/PowerSettings';
import { get, sync } from 'vuex-pathify';

export default {
  components: { PowerSettingsIcon },
  computed: {
    accounts() {
      return ['BTC', ...this.user.accounts.map(a => a.asset)];
    },
    asset: sync('asset'),
    user: get('user'),
  },
  methods: {
    goHome() {
      if (this.user) this.$go('/home');
      else this.$go('/');
    },
  },
};
</script>

<style lang="stylus" scoped>
.truncate
  max-width 80px
  overflow hidden
  text-overflow ellipsis
  white-space nowrap

@media (max-width: 450px)
  .v-application .display-2
    font-size 1.4rem !important
</style>
