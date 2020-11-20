<template>


  <!-- 一个自动绘图组件 -->
  <!-- 参数：
    url：图片地址
    data：数据
    matrix：变换矩阵参数
    height：画布的高度,默认为750px
    width:画布的宽度，默认为300px
 -->
  <div class="card-container">
    <button @click="addListener">配置测压管</button>
    <button @click="addListener">拾取坐标</button>
    <canvas id="canvas" width="900px" height="300px" />
  </div>

</template>

<script>
// import { addMatrixParam, getBgUrl } from '@/api/canvas'
export default {
  components: {

  },
  data() {
    return {
      // 基准点数量，不允许超过2个
      basePointNum: 0,

      canvas: null,
      ctx: null,

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
      scale: 2,
      // 放大后区域
      scaleGlassRectangle: null,
      // url: '/image/bt.jpg',
      url: './btb.png',
      b: 900,
      h: 300,
      // 监测数据
      mData: {
        url: '/btb.png',
        line: [
          {
            x: 20,
            y: 50
          },
          {
            x: 40,
            y: 10
          },
          {
            x: 40,
            y: 50
          },
          {
            x: 60,
            y: 10
          },
          { x: 70,
            y: 50
          },
          { x: 80,
            y: 10 }
        ] },
      matrixParam: {
        y1: 0,
        y2: 0,
        z1: 0,
        z2: 0,
        z0: 0
      },
      bgid: null,
      line: [],
      point: [],
      lastPoint: [],
      test: true,
      img: new Image() // 创建一个<img>元素
    }
  },
  computed: {

  },
  mounted() {
    this.canvas = document.getElementById('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.drawBackGround(this.url, this.b, this.h)
    console.log(this.canvas)
  },
  methods: {
    getBgUrl(project_id) {
      const res = getBgUrl(project_id)
      console.log(res)
    },

    // 获取坐标
    getXY(e) {
      // return { 'x': e.layerX, 'y': e.layerY }
      return { 'x': e.offsetX, 'y': e.offsetY }
    },

    // 绘制背景图片
    drawBackGround(url, b, h) {
      this.img.src = url // 设置图片源地址
      this.ctx.drawImage(this.img, 0, 0, b, h)
    },
    // 绘制放大镜
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
      var gradient = this.ctx.createRadialGradient(
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

    // 动态绘制背景及放大镜
    draw() {
      // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.drawBackGround(this.url, this.b, this.h)
      this.calOriginalRectangle(this.centerPoint)
      this.drawMagnifyingGlass()
    },

    addListener() {
      let that = this
      // 鼠标移动事件
      this.canvas.onmousemove = function(e) {
        that.centerPoint = that.getXY(e)
        that.draw()
      }
      // 鼠标单击事件，提交选定的坐标
      this.canvas.onclick = function(e) {
        let point = that.getXY(e)
        that.submitXY(point)
      }
    },

    submitXY(point) {
      this.$prompt('请输入当前高程（m）', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /[1-9]\d*/,
        inputErrorMessage: '请输入高程（单位：米）'
      }).then(({ value }) => {
        this.$message({
          type: 'success',
          message: '当前输入的高程为: ' + value + 'm'
        })
        this.canvas.onclick = null
        this.canvas.onmousemove = null
        this.drawBackGround(this.url, this.b, this.h)
        // this.matrixParam.y2 = point.y
        // this.matrixParam.z2 = value
        // this.matrixParam.z0 = this.matrixParam.z1 - this.matrixParam.y1 * (this.matrixParam.z2 - this.matrixParam.z1) / (this.matrixParam.y2 - this.matrixParam.y1)
        // console.log(this.matrixParam)
        // this.matrixParam.y1 = this.matrixParam.y2
        // this.matrixParam.z1 = this.matrixParam.z2
        var matrixParam = {
          'bgid': this.bgid,
          'url': this.url,
          'b': this.b,
          'h': this.h,
          'z': value * 1,
          'x': point.x,
          'y': point.y
        }
        addMatrixParam(matrixParam)
        console.log(point)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    },
    windowToCanvas(x, y) {
      // var bbox = this.canvas.getBoundingClientRect()
      var bbox = this.canvas.getBoundingClientRect()
      return { x: x - bbox.left, y: y - bbox.top }
    },

    // 计算图片被放大的区域的范围
    calOriginalRectangle(point) {
      this.originalRectangle.x = point.x - this.originalRadius
      this.originalRectangle.y = point.y - this.originalRadius
      this.originalRectangle.width = this.originalRadius * 2
      this.originalRectangle.height = this.originalRadius * 2
    },
    // 绘制折线
    drawMLine(line) {
      this.ctx.beginPath()
      this.ctx.moveTo(line[0].x, line[0].y)
      for (var i = 1; i < line.length; i++) {
        this.ctx.lineTo(line[i].x, line[i].y)
      }
      this.ctx.strokeStyle = 'green'
      this.ctx.stroke()
    },
    drawPline(e) {
      var obj = this.getXY(e)
      var x = obj.x
      var y = obj.y
      this.point[0] = x
      this.point[1] = y
      this.ctx.beginPath()
      if (this.test) {
        this.test = false
      } else {
        this.ctx.moveTo(this.lastPoint[0], this.lastPoint[1])
        this.ctx.lineTo(x, y)
      }
      this.lastPoint[0] = this.point[0]
      this.lastPoint[1] = this.point[1]
      var tempPointx = this.point[0]
      var tempPointy = this.point[1]
      this.line.push([tempPointx, tempPointy])
      console.log(this.line)
      console.log(e)
      this.ctx.strokeStyle = 'green'
      this.ctx.stroke()
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
.card{

  width:500px;
  height:250px;
  display:inline-flex;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  align-items: center;
  justify-content: center;
}

#canvas {
    display: block;
    border: 1px solid red;
    margin: 0 auto;
    cursor: crosshair;
}

</style>

