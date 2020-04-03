<script>
import { call } from 'vuex-pathify';

export default {
  methods: {
    copy(v) {
      var textArea = document.createElement('textarea');
      textArea.style.position = 'fixed';
      textArea.value = v;

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      document.execCommand('copy');
      document.body.removeChild(textArea);

      this.snack('Copied to Clipboard');
    },
    snack: call('snack'),
  },
}
</script>
