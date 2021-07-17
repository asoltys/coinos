<template>
  <v-app-bar v-if="!fullscreen" absolute app dark color="black" fixed>
    <v-toolbar-title
      dark
      @click="goHome"
      class="display-2 unselectable"
      style="cursor: pointer"
      >coin<span class="primary--text">os</span></v-toolbar-title
    >
    <v-spacer></v-spacer>
    <v-btn
      color="#59316B"
      @click="go('http://uzmim34vid5dkyzjxpel6zbkfz4qeqaaqe3gqrtbmekhxqglvzau73ad.onion/')"
      v-if="showTorButton"
    >
      <v-icon left>$tor</v-icon>
      Tor Hidden Service
    </v-btn>
    <v-menu class="ml-2" v-if="user && user.id" offset-y nudge-bottom="1">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on">
          <v-avatar class="mr-2" v-if="user.pic" size="30">
            <img :src="user.pic" />
          </v-avatar>
          <v-icon v-else>$account</v-icon>
          <span class="truncate">{{ username }} </span>
        </v-btn>
      </template>
      <v-card tile class="mx-auto menu" max-width="400">
        <v-list-item @click="go('https://corporate.coinos.io/')">
          <v-list-item-action>
            <v-icon color="blue lighten-2" title="About">$help</v-icon>
          </v-list-item-action>
          <v-list-item-content>About</v-list-item-content>
        </v-list-item>
        <v-list-item color="red lighten-2" v-if='user.admin' @click="$go('/admin')">
          <v-list-item-action>
            <v-icon color="orange" title="Administration">$settings</v-icon>
          </v-list-item-action>
          <v-list-item-content>Admin</v-list-item-content>
        </v-list-item>
        <v-list-item @click="$go('/referral')">
          <v-list-item-action>
            <v-icon color="green" title="Refer Friend">$addAccount</v-icon>
          </v-list-item-action>
          <v-list-item-content>Refer Friends</v-list-item-content>
        </v-list-item>
        <v-list-item @click="$go('/settings')">
          <v-list-item-action>
            <v-icon color="primary" title="Settings">$settings</v-icon>
          </v-list-item-action>
          <v-list-item-content>Settings</v-list-item-content>
        </v-list-item>
        <v-list-item @click="$go('/logout')">
          <v-list-item-action>
            <v-icon title="Logout" color="pink">$power</v-icon>
          </v-list-item-action>
          <v-list-item-content>Sign Out</v-list-item-content>
        </v-list-item>
      </v-card>
    </v-menu>
    <v-btn v-else @click="go('https://corporate.coinos.io/')" class="ml-auto">
      <v-icon left>$help</v-icon>
      About
    </v-btn>
  </v-app-bar>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';

export default {
  computed: {
    fullscreen: get('fullscreen'),
    username() {
      if (this.user.username.startsWith('satoshi')) return 'satoshi';
      return this.user.username;
    },
    accounts() {
      return ['BTC', ...this.user.accounts.map(a => a.asset)];
    },
    asset: sync('asset'),
    user: get('user'),
    showTorButton() {
      return window.screen.width === window.innerWidth &&
      window.screen.height === window.innerHeight;
    }
  },
  methods: {
    generateBlock: call('generateBlock'),
    goHome() {
      if (this.user && this.user.id) this.$go('/home');
      else this.$go('/');
    },
    go(url) {
      window.location.href = url;
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
