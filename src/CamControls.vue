<template lang="pug">
  #camcontrols
    #crosshair
    #controls
      #cancel Stop
</template>

<style scoped lang="stylus">
  #camcontrols 
    position absolute
    height 100%
    width 100%
    top 0px
    left 0px
    display none

  #crosshair 
    position absolute
    display block
    width 200px
    height 200px
    border 10px dashed yellow
    top 50%
    left 50%
    margin -100px 0 0 -100px
   
  #controls 
    position absolute
    margin-left auto
    left 50%
    display block
    width 300px
    bottom 10px
    background yellow
    text-align center
    color black
    font-family Roboto, sans-serif
    font-size 32px
    border-radius 15px
    z-index 500
    margin 0 0 0 -150px
</style>
