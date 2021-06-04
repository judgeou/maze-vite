<template>
  <div>
    <div>
      <input type="file" accept="image/*" @change="onFile">
    </div>

    <div class="maze-view">
      <canvas style="z-index: 0" ref="canvas"></canvas>
      <canvas style="z-index: 1" ref="canvasChecked"></canvas>
      <canvas style="z-index: 2" ref="canvasPath"></canvas>
    </div>

  </div>
</template>

<script>
import { solveMaze } from './maze'

export default {
  data () {
    return {
      nodeGraph: {},
      width: 0,
      height: 0,
      path: [],
      current: null
    }
  },
  methods: {
    onFile ({ target }) {
      let vm = this
      let { files } = target
      if (files.length) {
        let url = URL.createObjectURL(files[0])
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
          
          let imgData = ctx.getImageData(0, 0, width, height)
          let rgbaArray = new Int32Array(imgData.data.buffer)
          let m = rgbaArray.map(item => item === -1 ? 1 : 0) // -1 可以理解为 rgba(255,255,255,255)，即为白色
          vm.reload(m, [35,9], [243,235])
          
          URL.revokeObjectURL(url)
        }
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
    async reload (m, begin, end) {
      let vm = this
      let { width, height } = vm
      let { canvasChecked, canvasPath } = vm.$refs
      await solveMaze(m, width, height, begin, end, (nodeGraph, current, path) => {
        let ctxChecked = canvasChecked.getContext('2d')
        ctxChecked.fillStyle = "#74b9ff"
        ctxChecked.fillRect(current.x, current.y, 1, 1)

        let ctxPath = canvasPath.getContext('2d')
        ctxPath.clearRect(0, 0, canvasPath.width, canvasPath.height)
        ctxPath.fillStyle = '#FF0000'
        for (let node of path) {
          ctxPath.fillRect(node.x, node.y, 1, 1)
        }
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
