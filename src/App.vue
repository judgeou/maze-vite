<template>
  <div>
    <div>
      <input type="file" accept="image/*" @change="onFile">
      
      模式：
      <label><input type="radio" name="mode" value="1" v-model="mode" /> 严格 </label>
      <label><input type="radio" name="mode" value="2" v-model="mode" /> 模糊 </label>
      
      动画速度：<input type="number" v-model.number="skipCount">
      <span v-show="clickPoints.length < 2">请点击图片的任意两处开始寻路 </span>
      <span v-show="begin">起点：{{ begin }}</span>
      <span v-show="end">终点：{{ end }}</span>
    </div>
    <hr>
    <div>
      width: <input type="number" v-model.number="widthInput"> height: <input type="number" v-model.number="heightInput">
      速度倍率：<input type="number" v-model.number="generatSpeed">
      方格大小：<input type="number" v-model.number="cellSize">
      <button @click="generatMaze">生成迷宫</button>
    </div>

    <div class="maze-view" @click="onClickMaze">
      <canvas style="z-index: 0" ref="canvas"></canvas>
      <canvas style="z-index: 1" ref="canvasChecked"></canvas>
      <canvas style="z-index: 2" ref="canvasPath"></canvas>
    </div>

  </div>
</template>

<script>
import { solveMaze, MazeGanerator } from './maze'
import defaultMazeImg from './assets/maze1.png'

async function waitFrame () {
  return new Promise((resolve) => requestAnimationFrame(resolve))
}

export default {
  data () {
    return {
      width: 0,
      height: 0,
      widthInput: 8,
      heightInput: 8,
      mode: "1",
      path: [],
      clickPoints: [],
      current: null,
      isExitSolve: false,
      skipCount: 5000,
      generatSpeed: 1,
      cellSize: 50
    }
  },
  computed: {
    begin () {
      let { clickPoints } = this
      if (clickPoints.length >= 2) {
        return clickPoints[clickPoints.length - 2]
      } else if (clickPoints.length === 1) {
        return clickPoints[0]
      } else {
        return null
      }
    },
    end () {
      let { clickPoints } = this
      if (clickPoints.length >= 2) {
        return clickPoints[clickPoints.length - 1]
      } else {
        return null
      }
    }
  },
  methods: {
    onFile ({ target }) {
      let vm = this
      let { files } = target
      if (files.length) {
        let url = URL.createObjectURL(files[0])
        vm.loadImage(url)
      }
    },
    loadImage (url) {
      let vm = this
      vm.clickPoints = []
      let image = new Image()
      image.src = url
      
      image.onload = () => {
        let { canvas, canvasChecked, canvasPath } = vm.$refs
        let width = canvas.width = vm.width = image.width
        let height = canvas.height = vm.height = image.height
        canvasPath.width = canvasChecked.width = width
        canvasPath.height = canvasChecked.height = height

        let ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, width, height)

        URL.revokeObjectURL(url)
      }
    },
    async generatMaze () {
      let vm = this
      let { widthInput, heightInput, cellSize } = this
      let { canvas, canvasChecked, canvasPath } = this.$refs
      let generator = new MazeGanerator(widthInput, heightInput, cellSize)
      generator.build()
      generator.renderCanvas(canvas)

      this.width = widthInput * generator.cellSize
      this.height = heightInput * generator.cellSize
      this.clickPoints = []
      canvasChecked.getContext('2d').clearRect(0, 0, canvasChecked.width, canvasChecked.height)
      canvasPath.getContext('2d').clearRect(0, 0, canvasPath.width, canvasPath.height)

      let count = 0
      await generator.breakWall(async (current) => {
        count++
        if (count % vm.generatSpeed === 0) {
          generator.renderCanvas(canvas, current)
          return waitFrame()
        }
      })

      generator.renderCanvas(canvas)
    },
    onClickMaze ($event) {
      let { clickPoints } = this
      clickPoints.push([$event.offsetX, $event.offsetY])
      if (clickPoints.length >= 2) {
        this.reload()
      }
    },
    indexToPos (i) {
      let y = i % this.width
      let x = Math.floor(i / this.width)
      return { x, y }
    },
    cellStyle (i) {
      let { x, y } = this.indexToPos(i)
      return { left: `${y * 1.25}em`, top: `${x * 1.25}em` }
    },
    async reload () {
      let vm = this
      let { width, height } = vm
      let { canvas, canvasChecked, canvasPath } = vm.$refs

      canvasPath.width = canvasChecked.width = width
      canvasPath.height = canvasChecked.height = height

      let ctx = canvas.getContext('2d')
      let imgData = ctx.getImageData(0, 0, width, height)
      let m = new Uint32Array(imgData.data.buffer)

      let ctxChecked = canvasChecked.getContext('2d')
      ctxChecked.clearRect(0, 0, width, height)

      this.isExitSolve = true
      await waitFrame() // 等待一下，让上次的 solve 退出
      this.isExitSolve = false

      let count = 0

      await solveMaze(m, width, height, vm.begin, vm.end, vm.mode, async (nodeGraph, current, path, done) => {
        ctxChecked.fillStyle = "#74b9ff"
        ctxChecked.fillRect(current.x, current.y, 1, 1)

        count++
        if (count > vm.skipCount || done) {
          let ctxPath = canvasPath.getContext('2d')
          ctxPath.clearRect(0, 0, canvasPath.width, canvasPath.height)
          ctxPath.fillStyle = '#FF0000'
          for (let node of path) {
            ctxPath.fillRect(node.x, node.y, 1, 1)
          }
          await waitFrame()
          count = 0
        }

        return vm.isExitSolve
      })
    }
  },
  async created () {
    // this.loadImage(defaultMazeImg)
  }
}
</script>

<style>
.row {
  margin-bottom: 1em;
}
.maze-view {
  position: relative;
}
.maze-view canvas {
  position: absolute;
}
</style>
