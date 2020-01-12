<template>
  <v-app-bar absolute app dark color="black" fixed>
    <v-toolbar-title
      dark
      @click="$router.push('/home')"
      class="display-2"
      style="cursor: pointer"
      >coin<span class="yellow--text">os</span></v-toolbar-title
    >
    <v-spacer></v-spacer>
    <v-btn icon @click="$router.push('/about')">
      <flash-icon fillColor="yellow" title="About CoinOS"></flash-icon>
    </v-btn>
    <v-menu class="ml-2" v-if="user && user.name" offset-y nudge-bottom="1">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on">
          <v-avatar class="mr-2" v-if="user.pic" size="30">
            <img :src="user.pic" />
          </v-avatar>
          <v-icon v-else>person</v-icon>
          <span class="d-none d-sm-inline">{{ user.name }}</span>
        </v-btn>
      </template>
      <v-card tile class="mx-auto menu" max-width="400">
        <v-list-item @click="$router.push('/settings')">
          <v-list-item-action>
            <v-icon>settings</v-icon>
          </v-list-item-action>
          <v-list-item-content>Settings</v-list-item-content>
        </v-list-item>
        <v-list-item @click="$router.push('/logout')">
          <v-list-item-action>
            <power-settings-icon title="Logout" />
          </v-list-item-action>
          <v-list-item-content>Logout</v-list-item-content>
        </v-list-item>
      </v-card>
    </v-menu>
  </v-app-bar>
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
