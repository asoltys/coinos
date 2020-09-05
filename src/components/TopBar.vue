<template>
  <v-app-bar absolute app dark color="black" fixed>
    <v-toolbar-title
      dark
      @click="goHome"
      class="display-2 unselectable"
      style="cursor: pointer"
      >coin<span class="yellow--text">os</span></v-toolbar-title
    >
    <v-spacer></v-spacer>
    <v-menu class="ml-2" v-if="user && user.id" offset-y nudge-bottom="1">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on">
          <v-avatar class="mr-2" v-if="user.pic" size="30">
            <img :src="user.pic" />
          </v-avatar>
          <v-icon v-else>$account</v-icon>
          <span class="truncate">{{
            username
          }}
          </span>
        </v-btn>
      </template>
      <v-card tile class="mx-auto menu" max-width="400">
        <v-list-item @click="$go('/about')">
          <v-list-item-action>
            <v-icon>$help</v-icon>
          </v-list-item-action>
          <v-list-item-content>About</v-list-item-content>
        </v-list-item>
        <v-list-item @click="$go('/settings')">
          <v-list-item-action>
            <v-icon>$settings</v-icon>
          </v-list-item-action>
          <v-list-item-content>Settings</v-list-item-content>
        </v-list-item>
        <v-list-item @click="$go('/logout')">
          <v-list-item-action>
            <v-icon title="Logout">$power</v-icon>
          </v-list-item-action>
          <v-list-item-content>Sign Out</v-list-item-content>
        </v-list-item>
        <!--
        <v-list-item v-if="!$prod" @click="generateBlock('bitcoin')">
          <v-list-item-action>
            <v-icon>$sync</v-icon>
          </v-list-item-action>
          <v-list-item-content>Generate Bitcoin</v-list-item-content>
        </v-list-item>
        <v-list-item v-if="!$prod" @click="generateBlock('liquid')">
          <v-list-item-action>
            <v-icon>$sync</v-icon>
          </v-list-item-action>
          <v-list-item-content>Generate Liquid</v-list-item-content>
        </v-list-item>
        -->
      </v-card>
    </v-menu>
    <v-btn icon v-else @click="$go('/about')">
      <v-icon>$help</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';

export default {
  computed: {
    username() {
      if (this.user.username.startsWith('Guest')) return 'Guest';
      return this.user.username;
    },
    accounts() {
      return ['BTC', ...this.user.accounts.map(a => a.asset)];
    },
    asset: sync('asset'),
    user: get('user'),
  },
  methods: {
    generateBlock: call('generateBlock'), 
    goHome() {
      if (this.user && this.user.id) this.$go('/home');
      else this.$go('/');
    },
  },
};
</script>

<style lang="stylus" scoped>
.unselectable 
  -webkit-touch-callout none
  -webkit-user-select none
  -khtml-user-select none
  -moz-user-select none
  -ms-user-select none
  user-select none
</style>
