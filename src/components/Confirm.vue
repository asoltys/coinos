<template>
  <div v-if="route">
    <h1>Are you sure?</h1>
    <span>Amount {{amount}}</span>
    <span>Fee {{route.total_amt - parseInt(amount)}}</span>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import bolt11 from 'bolt11';

export default {
  computed: {
    payreq: get('payreq'),
    amount() { return bolt11.decode(this.payreq).satoshis },
    route: get('route'),
  },
} 
</script>

