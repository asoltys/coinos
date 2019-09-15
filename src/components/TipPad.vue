<template>
  <div class="tippad text-right" style="direction: rtl">
    <div class="mb-2">
      <span class="display-1">{{ tip }}</span>
      +
    </div>
    <v-btn
      v-for="i in percents"
      :class="`my-1 ${percent === i && 'secondary'}`"
      @click="percent = i"
      :key="i"
    >
      <span v-if="i === 0">No Tip</span>
      <span v-else>{{ i }}%+</span>
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
      percents: [0, 10, 15, 20],
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
  width 100%
  height 50px !important
</style>
