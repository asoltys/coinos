<template lang="pug">
div
  v-card
    v-card-text
      p CoinOS is a Bitcoin wallet and point of sale app that you can use to send and receive payments.
      p It supports normal bitcoin transactions as well as lightning network payments.
      p The app is free to use and the source code is available on #[a(href="https://github.com/asoltys/coinos.io") Github] in case you want to host your own copy, report issues, or contribute to make it better.
      p This app is under development. It's not well tested or secured and funds are held in custody on the server so don't put in more than you're willing to lose.
      div.code(:data-clipboard-text='node').text-xs-center
        h3 Lightning Node Info
        canvas#qr
        p.mt-3 {{node}}
        div
          v-btn(@click="copy")
            v-icon.mr-1 content_copy
            span Copy
</template>

<script>
import qr from 'qrcode'
import { mapActions } from 'vuex'

const node = '02868e12f320073cad0c2959c42559fbcfd1aa326fcb943492ed7f02c9820aa399@coinos.io:9735'

export default {
  data () { return { node } },

  mounted () {
    let canvas = document.getElementById('qr')
    if (!canvas) return
    qr.toCanvas(canvas, node, e => { if (e) console.log(e) })
  },

  methods: {
    ...mapActions(['snack']),
    copy () {
      var textArea = document.createElement('textarea')
      textArea.style.position = 'fixed'
      textArea.value = node

      document.body.appendChild(textArea)

      textArea.focus()
      textArea.select()

      document.execCommand('copy')
      document.body.removeChild(textArea)

      this.snack('Copied to Clipboard')
    },
  },
} 
</script>

<style lang="stylus">
  a
    color white
    font-weight bold

  .code
    margin auto
    background #333
    word-wrap break-word
    padding 10px
</style>
