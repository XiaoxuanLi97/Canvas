<template>
  <div>
    <canvas id="canvas" :width="canvasWidth" :height="canvasHeight"/>
    <div class="coordConfig">
      <h3>1.配置坐标系</h3>
      <p>---请选择高度差距大的高度标注线---</p>
      <button @click="configCoordinate1">拾取坐标1</button>
      <button @click="configCoordinate2">拾取坐标2</button>
      <button @click="submitCoord">配置坐标</button>

      <h3>2.配置测压管位置</h3>
      <p>---点击按钮开始配置---</p>
      <button @click="configPosition">配置测压管</button>

      <h3>3.绘制测压管</h3>
      <p>---点击按钮绘制测压管---</p>
      <button @click="plotTube">绘制测压管</button>
      <button @click="plotLevel">绘制浸水线</button>
      <button @click="draw">重新绘制</button>
    </div>
  </div>
</template>

<script>

export default {
  name: "test",
  data(){
    return {
      //canvas绘制数据
      canvasWidth:1300,
      canvasHeight:260,
      canvas:null,
      ctx:null,
      img:new Image(),

      //图片数据
      img1:{
        id:1,
        url:'/btb.png',
      },
      imgScale:0.7, //canvas加载图片缩放比

      //配置坐标系数据
      imageConfig:{
        y1:0, //真实坐标y1
        y1C:0,//canvas坐标y1
        y2:0, //真实坐标y2
        y2C:0,//canvas坐标y2
        M: {  //坐标转换参数
          yk: 1,
          yb: 0
        }
      },

      //模拟测压管位置信息
      pTubeData:[
        {
          id:'1',
          yTop:30.3,
          yBot:9.16,
          yWat:22.66
        },
        {
          id:'2',
          yTop:30.3,
          yBot:7.97,
          yWat:12.73
        },
        {
          id:'3',
          yTop:23.05,
          yBot:9.16,
          yWat:13.72
        },
        {
          id:'4',
          yTop:16.9,
          yBot:7.97,
          yWat:12.73
        }
      ],

      // 图片被放大区域的中心点，也是放大镜的中心点
      centerPoint: {
        x: 200,
        y: 200
      },
      // 图片被放大区域的半径
      originalRadius: 100,
      // 图片被放大区域
      originalRectangle: {},
      // 放大倍数
      scale: 3,
      // 放大后区域
      scaleGlassRectangle: null,
    }
  },

  methods: {
    //绘图
    drawBackGround(url) {
      this.img.src = url // 设置图片源地址
      this.img.onload = () => {
        const w = this.img.width*this.imgScale;
        const h = this.img.height*this.imgScale;
        this.ctx.drawImage(this.img, 0, 0, w, h)
      }
    },
    addListener() {
      let that = this
      // 鼠标移动事件
      this.canvas.onmousemove = function(e) {
        that.centerPoint = that.getXY(e)
        that.draw()
      }
    },

    //拾取两个点的坐标
    configCoordinate1(){
      this.addListener()
      let that = this
      this.canvas.onclick = function(e) {
        const point = that.getXY(e)
        that.submitConfig1(point)
      }
    },
    configCoordinate2(){
      this.addListener()
      let that = this
      this.canvas.onclick = function(e) {
        const point = that.getXY(e)
        that.submitConfig2(point)
      }
    },
    submitConfig1(point) {
      this.$prompt('请输入当前高程(m)', '拾取坐标1',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /[1-9]\d*/,
        inputErrorMessage: '请输入高程(单位：米)'
      }).then(({value}) => {
        this.$message({
          type: 'success',
          message: '当前输入的高程为: ' + value + 'm'
        })
        this.canvas.onclick = null
        this.canvas.onmousemove = null
        this.drawBackGround(this.img1.url)

        //计算imageConfig

        this.imageConfig.y1C = point.y //canvas画布y坐标
        this.imageConfig.y1 = value //真实y坐标

        console.log(this.imageConfig)

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    },
    submitConfig2(point) {
      this.$prompt('请输入当前高程(m)', '拾取坐标2',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /[1-9]\d*/,
        inputErrorMessage: '请输入高程(单位：米)'
      }).then(({value}) => {
        this.$message({
          type: 'success',
          message: '当前输入的高程为: ' + value + 'm'
        })
        this.canvas.onclick = null
        this.canvas.onmousemove = null
        this.drawBackGround(this.img1.url)

        //计算imageConfig
        this.imageConfig.y2C = point.y //canvas画布y坐标
        this.imageConfig.y2 = value //真实y坐标

        console.log(this.imageConfig)

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    },

    //配置坐标系转换参数
    submitCoord(){
      let b1 =  this.imageConfig.y2C;
      let b2 =  this.imageConfig.y1C;
      let a1 =  this.imageConfig.y2;
      let a2 =  this.imageConfig.y1;

      this.imageConfig.M.yk = (b1-b2)/(a1-a2)
      this.imageConfig.M.yb = b2 - a2 * this.imageConfig.M.yk
      console.log(this.imageConfig)
    },

    //配置测压管位置
    configPosition(){
      this.addListener()
      let that = this
      this.canvas.onclick = function(e) {
        const point = that.getXY(e)
        that.submitPosition(point)
        console.log(that.pTubeData)
      }
    },
    submitPosition(point){
      this.$prompt('请输入当前测压管id', '测压管位置配置',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /[1-9]\d*/,
        inputErrorMessage: '请输入正确的id'
      }).then(({value}) => {
        this.$message({
          type: 'success',
          message: '当前输入的测压管id为: ' + value
        })
        this.canvas.onclick = null
        this.canvas.onmousemove = null
        this.pTubeData.forEach((val)=>{
          if(val.id === value){
            val.x = point.x;
            val.y = point.y;
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    },

    //获取鼠标坐标
    getXY(e) {
      return { 'x': e.offsetX, 'y': e.offsetY }

    },

    //放大镜
    draw() {
      // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.drawBackGround(this.img1.url)
      this.calOriginalRectangle(this.centerPoint)
      this.drawMagnifyingGlass()
    },
    calOriginalRectangle(point) {
      this.originalRectangle.x = point.x - this.originalRadius
      this.originalRectangle.y = point.y - this.originalRadius
      this.originalRectangle.width = this.originalRadius * 2
      this.originalRectangle.height = this.originalRadius * 2
    },
    drawMagnifyingGlass() {
      this.scaleGlassRectangle = {
        x: this.centerPoint.x - this.originalRectangle.width * this.scale / 2,
        y: this.centerPoint.y - this.originalRectangle.height * this.scale / 2,
        width: this.originalRectangle.width * this.scale,
        height: this.originalRectangle.height * this.scale
      }
      this.ctx.save()
      this.ctx.beginPath()
      // 绘制一个圆形
      this.ctx.arc(this.centerPoint.x, this.centerPoint.y, this.originalRadius, 0, Math.PI * 2, false)
      this.ctx.clip()

      this.ctx.drawImage(this.canvas,
          this.originalRectangle.x, this.originalRectangle.y,
          this.originalRectangle.width, this.originalRectangle.height,
          this.scaleGlassRectangle.x, this.scaleGlassRectangle.y,
          this.scaleGlassRectangle.width, this.scaleGlassRectangle.height
      )
      this.ctx.restore()

      this.ctx.beginPath()

      // 创建放射状/圆形渐变对象
      let gradient = this.ctx.createRadialGradient(
          this.centerPoint.x, this.centerPoint.y, this.originalRadius - 5,
          this.centerPoint.x, this.centerPoint.y, this.originalRadius)
      gradient.addColorStop(0, 'rgba(0,0,0,0.2)')
      gradient.addColorStop(0.80, 'silver')
      gradient.addColorStop(0.90, 'silver')
      gradient.addColorStop(1.0, 'rgba(150,150,150,0.9)')

      this.ctx.strokeStyle = gradient
      this.ctx.lineWidth = 5
      this.ctx.arc(this.centerPoint.x, this.centerPoint.y, this.originalRadius, 0, Math.PI * 2, false)
      this.ctx.stroke()
    },

    //绘制测压管
    plotTube(){
      this.pTubeData.forEach((val)=>{
        let x = val.x, //需要在网页中配置
            k = this.imageConfig.M.yk,
            b = this.imageConfig.M.yb,
            yTop = val.yTop * k + b,
            yBot = val.yBot * k + b

        this.ctx.beginPath();
        this.ctx.moveTo(x,yBot);
        this.ctx.lineTo(x,yTop);
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke()
      })
    },

    //绘制浸润线
    plotLevel(){
      let yWat = [];

      for ( let i=0; i<this.pTubeData.length;i++){
       yWat.push(this.pTubeData[i].yWat)
      }

      let yWatC = yWat.map(n => n*this.imageConfig.M.yk+this.imageConfig.M.yb)

      const x0 = this.pTubeData[0].x;
      const y0 = yWatC[0];
      this.ctx.beginPath();
      this.ctx.moveTo(x0,y0);
      for ( let i=1; i<this.pTubeData.length;i++){
       let x = this.pTubeData[i].x,
           y = Number(yWatC[i]);
       this.ctx.lineTo(x,y);
      }
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.strokeStyle = 'blue';
      this.ctx.stroke()
    }
  },
  mounted() {
    this.canvas = document.getElementById('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.drawBackGround(this.img1.url, this.canvasWidth, this.canvasHeight)
    console.log(this.canvas)

  },
}

</script>

<style scoped>
#canvas {
  display: block;
  border: 1px solid red;
  margin: 0 auto;
  cursor: crosshair;
}
.coordConfig {
  text-align: center;
}
</style>
