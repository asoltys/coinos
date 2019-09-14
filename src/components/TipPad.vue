<template>
  <div class="tippad text-right" style="direction: rtl">
    <div class="mb-2">
      <span class="display-1">{{ tip }}</span>
      +
    </div>
    <v-btn :class="percent === 0 && 'secondary'" @click="percent = 0">
      No Tip
    </v-btn>
    <v-btn :class="percent === 10 && 'secondary'" @click="percent = 10">
      +10%
    </v-btn>
    <v-btn :class="percent === 15 && 'secondary'" @click="percent = 15">
      +15%
    </v-btn>
    <v-btn :class="percent === 20 && 'secondary'" @click="percent = 20">
      +20%
    </v-btn>
  </div>
</template>

<script>
export default {
  props: {
    amount: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      percent: 0,
    };
  },

  computed: {
    tip() {
      let tip = (this.percent * this.amount * 0.01).toFixed(2);
      this.$emit('update', tip);
      return tip;
    },
  },
};
</script>

<style lang="stylus" scoped>
.v-btn
  width: 100%;
  margin-bottom 10px
  margin-right 0
  height 50px !important
</style>
