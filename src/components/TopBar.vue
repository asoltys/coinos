<template lang="pug">
v-toolbar(absolute app dark color="black" clipped-left fixed)
  v-toolbar-title(dark @click='$router.push("/home")')
    img.logo(src='static/img/coinos_logo.png')
  v-spacer
  v-btn(icon @click='$router.push("/about")')
    flash-icon(fillColor="yellow" title="About CoinOS")
  v-btn(v-if='user' icon @click='$router.push("/logout")')
    power-settings-icon(title="Logout")
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
