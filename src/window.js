import Vue from 'vue';

const Window = new Vue({
  data() {
    return {
      prompt: null,
    };
  },
  created() {
    window.addEventListener('beforeinstallprompt', e => {
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        this.prompt = e;
      }
    });
  },
});

export default Window;
