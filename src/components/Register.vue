<template lang="pug">
v-layout
  v-flex(xs12 md3)
    v-alert(v-if='error' value='error') {{error}}
    v-form(@submit='submit')
      v-text-field(label='Username' v-model='user.username' autofocus)
      v-text-field(label='Email' v-model='user.email')
      v-text-field(label='Passphrase' v-model='user.password' type='password')
      v-text-field(label='Confirm' v-model='user.passconfirm' type='password')
      v-btn(type='submit') Register
</template>

<script>
import bip39 from 'bip39'
import bitcoin from 'bitcoinjs-lib'
import AES from 'crypto-js/aes'
import { mapActions } from 'vuex'

export default {
  data () {
    return {
      user: {
        username: '',
        email: 'asoltys@gmail.com',
        password: '',
        passconfirm: '',
        unit: 'BTC',
        commission: '',
        pubkey: '',
        privkey: '',
        address: '',
      }, 
      error: '',
    }
  },

  methods: {
    async submit (e) {
      e.preventDefault()

      try {
        await this.createUser(this.user)
      } catch (e) {
        this.error = e.graphQLErrors[0].message
      }
    },

    ...mapActions(['createUser']),
  },

  mounted () {
    let mnemonic = bip39.generateMnemonic()
    let key = bitcoin.HDNode
      .fromSeedBuffer(bip39.mnemonicToSeed(mnemonic))
      .deriveHardened(44)
      .deriveHardened(0)
    this.user.pubkey = key.neutered().toBase58()
    this.user.privkey = AES.encrypt(key.toString(), this.user.password).toString()
  },
}
</script>
