<template>
  <span />
</template>

<script>
export default {
  props: {
    accountNumber: {
      type: Number,
      default: 0,
    },
  },

  data () {
    return {
      SAMPLE_LOYALTY_CARD_AID: 'F222222222',
      SELECT_APDU_HEADER: '00A40400',
      SELECT_OK_SW: '9000',
      UNKNOWN_CMD_SW: '0000',
    }
  },

  methods: {
    toPaddedHexString (i) {
      return ('00' + i.toString(16)).substr(-2)
    },

    buildSelectApdu (aid) {
      var aidByteLength = this.toPaddedHexString(aid.length / 2)
      var data = this.SELECT_APDU_HEADER + aidByteLength + aid
      return data.toLowerCase()
    },

    onCommand (command) {
      console.log(command)
      var commandAsBytes = new Uint8Array(command)
      var commandAsString = window.hce.util.byteArrayToHexString(commandAsBytes)
      var SELECT_APDU = this.buildSelectApdu(this.SAMPLE_LOYALTY_CARD_AID)

      console.log('received command ' + commandAsString)
      console.log('expecting        ' + SELECT_APDU)

      if (SELECT_APDU === commandAsString) {
        var accountNumberAsBytes = window.hce.util.stringToBytes(this.accountNumber)
        var data = window.hce.util.concatenateBuffers(accountNumberAsBytes, window.hce.util.hexStringToByteArray(this.SELECT_OK_SW))

        console.log('Sending ' + window.hce.util.byteArrayToHexString(data))
        window.hce.sendResponse(data)
      } else {
        console.log('UNKNOWN CMD SW')
        window.hce.sendResponse(window.hce.util.hexStringToByteArray(this.UNKNOWN_CMD_SW))
      }
    },

    onDeactivated (reason) {
      console.log('Deactivated ' + reason)
    },
  },

  mounted () {
    if (typeof window.hce !== 'undefined') {
      window.hce.registerCommandCallback(this.onCommand)
      window.hce.registerDeactivatedCallback(this.onDeactivated)
    }
  },
}
</script>
