<template>
  <v-toolbar absolute app dark color="black" clipped-left fixed>
    <v-toolbar-title dark @click="$router.push('/home')"
      ><img class="logo" src="../assets/coinos_logo.png"
    /></v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn icon @click="$router.push('/about')">
      <flash-icon fillColor="yellow" title="About CoinOS"></flash-icon>
    </v-btn>
    <v-menu v-if="user && user.name" offset-y>
      <v-btn slot="activator">
        <v-avatar class="mr-2" v-if="user.pic" size="30"
          ><img :src="user.pic"
        /></v-avatar>
        <v-icon v-else>person </v-icon><span>{{ user.name }}</span>
      </v-btn>
      <v-list>
        <v-list-tile @click="$router.push('/settings')">
          <v-list-tile-action>
            <v-icon>settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>Settings</v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="$router.push('/logout')">
          <v-list-tile-action>
            <power-settings-icon title="Logout"></power-settings-icon>
          </v-list-tile-action>
          <v-list-tile-content>Logout</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-toolbar>
</template>

<script>
import FlashIcon from 'vue-material-design-icons/Flash';
import PowerSettingsIcon from 'vue-material-design-icons/PowerSettings';
import { mapGetters } from 'vuex';

export default {
  components: { FlashIcon, PowerSettingsIcon },
  computed: mapGetters(['user']),
};
</script>
