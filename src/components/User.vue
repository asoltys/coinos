<template>
  <div>
    User
    {{ username }}
    <receive />
  </div>
</template>

<script>
import Receive from "./Receive";

export default {
  components: { Receive },
  props: {
    username: { type: String, default: '' },
  },
  mounted() {
    // this.getUser();
  },
};
</script>
