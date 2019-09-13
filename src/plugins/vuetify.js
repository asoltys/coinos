import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#ffff00',
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
