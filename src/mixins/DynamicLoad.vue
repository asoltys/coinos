<script>

import { call, get } from 'vuex-pathify';

export default {
  data() {
    return {
      loadedUser: false,
      waitedForUser: false
    } 
  },
  computed: {
    user: get('user'),
  },
  methods: {
    async waitForUser (seconds) {  
      var waited = 0

      const wait = resolve => {  
        if (this.user && (this.user.index || this.user.index === 0)) {
          this.loadedUser = true
          resolve(true)
        } else {
          if (waited < seconds || !seconds) {
            waited++
            return (this.timeout = setTimeout(() => wait(resolve), 1000));
          } else {
            console.log('timed out...')
            this.loadedUser = false
            resolve(false)
          }
        }
      }

      await new Promise(wait);
      this.waitedForUser = true
    }
  }
}
</script>