import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: colors.yellow,
        secondary: '#333',
        accent: '#ff0',
        error: '#b71c1c',
      },
    },
  },
  icons: {
    iconfont: 'mdi',
  },
});
