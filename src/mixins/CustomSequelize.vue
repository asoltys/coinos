<script>
import { call } from 'vuex-pathify';

export default {
  methods: {
    parseSequelizeData(data, subset) {
      console.log("PARSE SEQUELIZE")
      var reference = []
      var Nto1 = false
      
      // // Add attributes for sub objects if applicable 
      // var subsets = Object.keys(subset)
      // for (var j = 0; j < subsets.length; j++) {
      //   var alsoShow = subset[subsets[j]]
      //   console.log('Also Show: ' + JSON.stringify(alsoShow))
      // }

      console.log('Data: ' + JSON.stringify(data))
      console.log('Subsets: ' + JSON.stringify(subset))

      var showData = data.map((a, index) => {
        // Add attributes for sub objects if applicable 
        var subsets = Object.keys(subset)
        reference[index] = {}
        var record = a

        console.log(index + ' : ' + JSON.stringify(a))
        console.log('check ' + subsets.length)

        for (var j = 0; j < subsets.length; j++) {
          if (!a[subsets[j]]) {
            console.log('No data for ' + subsets[j])
            return a
          } else if (a[subsets[j]].length > 1) {
            Nto1 = true
          }

          var alsoShow = subset[subsets[j]]
          console.log(subsets[j] + ': also show: ' + JSON.stringify(alsoShow))
          reference[index][subsets[j]] = []

          console.log(subsets[j] + JSON.stringify(a[subsets[j]]))

          if (a[subsets[j]] && a[subsets[j]].length > 1) {
            tree = true
          } 

          if (a[subsets[j]].constructor === Array) {
            console.log(subsets[j] + ' Array detected ' + a[subsets[j]].length)
            for (var l = 0; l < a[subsets[j]].length; l++) {
              reference[index][subsets[j]][l] = {}
              console.log('update ref ' + subsets[j] + ': ' + JSON.stringify(reference))
              // }
              for (var k = 0; k < alsoShow.length; k++) {
                var value = a[subsets[j]][l][alsoShow[k]]
                if (typeof(value) === 'number') { 
                  value = value.toString(); 
                  console.log('convert ' + alsoShow[k] + ' to string')
                }
                console.log('set ' + subsets[j] + ' ' + l + ' : ' + alsoShow[k] + ' = ' + value)
                reference[index][subsets[j]][l][alsoShow[k]] = value
                console.log(JSON.stringify(reference))
              }
            }
          } else if (a[subsets[j]].constructor === Object) {
            console.log(subsets[j] + ' Object detected ' + a[subsets[j]])
            reference[index][subsets[j]][0] = {}
            for (var k = 0; k < alsoShow.length; k++) {
              console.log('get ' + alsoShow[k] + ' from ' + JSON.stringify(a[subsets[j]]))
              var value = a[subsets[j]][alsoShow[k]]
              if (typeof(value) === 'number') { 
                value = value.toString(); 
                console.log('convert ' + alsoShow[k] + ' to string')
              }
              console.log('set ' + subsets[j] + ' ' + 0 + ' : ' + alsoShow[k] + ' = ' + value)
              this.$set(reference[index][subsets[j]][0], alsoShow[k], value)
              reference[index][subsets[j]][0][alsoShow[k]] = value
              console.log(JSON.stringify(reference))
            }
          } else {
            console.log(subsets[j] + ' NOT Array ' + a[subsets[j]].constructor)
            record[alsoShow[k]] = a[subsets[j]][alsoShow[k]]
          }
        }
        console.log(index + ' Extra References for ' + index + ' : ' + JSON.stringify(reference[index]))
        console.log("Record: " + JSON.stringify(record))

        return record
      })

      console.log("Show Data: " + JSON.stringify(showData))
      console.log("References: " + JSON.stringify(reference))
      return {data: showData, references: reference, Nto1: Nto1}
    }
  }
}
</script>
