<template lang="pug">
v-toolbar(absolute app dark color="black" clipped-left fixed)
  v-toolbar-title(dark @click='$router.push("/home")')
    img.logo(src='../assets/coinos_logo.png')
  v-spacer
  v-btn(icon @click='$router.push("/about")')
    flash-icon(fillColor="yellow" title="About CoinOS")
  v-menu(v-if='user && user.name' offset-y)
    v-btn(slot='activator')
      v-avatar(v-if='user.pic' size='30').mr-2
        img(:src='user.pic')
      v-icon(v-else) person 
      span {{user.name}}
    v-list
      v-list-tile(@click='$router.push("/settings")')
        v-list-tile-action
          v-icon settings
        v-list-tile-content Settings
      v-list-tile(@click='$router.push("/logout")')
        v-list-tile-action
          power-settings-icon(title="Logout")
        v-list-tile-content Logout
</template>

<script>
import FlashIcon from 'vue-material-design-icons/Flash'
import InfoIcon from 'vue-material-design-icons/Information'
import PowerSettingsIcon  from 'vue-material-design-icons/PowerSettings'
import { mapGetters } from 'vuex'

export default {
  components: { FlashIcon, InfoIcon, PowerSettingsIcon },
  computed: mapGetters(['user']),
} 
</script>
