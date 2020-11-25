<template>
  <div id="app">
    <canvasDraw :pTubeData="pTubeData" :pTubeWat="pTubeWat" :img1="img1"/>
  </div>
</template>

<script>
import canvasDraw from './components/crossSection/crossSection'
export default {
  name: 'App',
  data(){
    return{
      img1: {
            id:'1',
            url: require('@/image/crossSection.png')
          },

      //模拟测压管位置信息
      pTubeData:[
        {
          id:'1',
          yTop:30.3,
          yBot:9.16,
        },
        {
          id:'2',
          yTop:30.3,
          yBot:7.97,
        },
        {
          id:'3',
          yTop:23.05,
          yBot:9.16,
        },
        {
          id:'4',
          yTop:16.9,
          yBot:7.97,
        },
      ],

      //浸润线
      pTubeWat:[
        {
          id:'1',
          yWat:22.66
        },
        {
          id:'2',
          yWat:12.73
        },
        {
          id:'3',
          yWat:13.72
        },
        {
          id:'4',
          yWat:12.73
        },
      ],
    }
  },
  components:{
    canvasDraw
  }
}
</script>

<style>

</style>
