<template>
  <div>
    <div>
      <input type="file" accept="image/*" @change="onFile">
      <input type="number" v-model.number="skipCount">
      <span v-show="clickPoints.length < 2">请点击图片的任意两处开始寻路</span>
      <span v-show="clickPoints.length >= 2">起点：{{ begin }}终点：{{ end }}</span>
    </div>

    <div class="maze-view" @click="onClickMaze">
      <canvas style="z-index: 0" ref="canvas"></canvas>
      <canvas style="z-index: 1" ref="canvasChecked"></canvas>
      <canvas style="z-index: 2" ref="canvasPath"></canvas>
    </div>

  </div>
</template>

<script>
import { solveMaze } from './maze'
import defaultMazeImg from './assets/maze1.png'

async function waitFrame () {
  return new Promise((resolve) => requestAnimationFrame(resolve))
}

export default {
  data () {
    return {
      width: 0,
      height: 0,
      path: [],
      clickPoints: [],
      current: null,
      isExitSolve: false,
      skipCount: 50
    }
  },
  computed: {
    begin () {
      let { clickPoints } = this
      if (clickPoints.length >= 2) {
        return clickPoints[clickPoints.length - 2]
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

      let ctx = canvas.getContext('2d')
      let imgData = ctx.getImageData(0, 0, width, height)
      let rgbaArray = new Int32Array(imgData.data.buffer)
      let m = rgbaArray.map(item => item === -1 ? 1 : 0) // -1 可以理解为 rgba(255,255,255,255)，即为白色

      let ctxChecked = canvasChecked.getContext('2d')
      ctxChecked.clearRect(0, 0, width, height)

      this.isExitSolve = true
      await waitFrame() // 等待一下，让上次的 solve 退出
      this.isExitSolve = false

      let count = 0

      await solveMaze(m, width, height, vm.begin, vm.end, async (nodeGraph, current, path, done) => {
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
    },
    onCellClick ($event, node) {
      if ($event.altKey) {
        this.nodeGraph.setEndNode(node)
      } else if ($event.ctrlKey) {

      } else {
        this.nodeGraph.switchNodeValue(node)
      }
    }
  },
  async created () {
    this.loadImage(defaultMazeImg)
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
