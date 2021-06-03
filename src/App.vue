<template>
  <div>
    <div class="div-matrix">
      <div class="cell"
        v-for="(node, i) in nodeGraph.nodes" :key="i"
        :class="{ black: node.value <= 0, path: path.indexOf(node) >= 0, queue: nodeGraph.queue.indexOf(node) >= 0 }"
        :style="cellStyle(i)"
        @click="onCellClick($event, node)">

        {{ node === current ? '🧍' : '' }}
        {{ node === nodeGraph.beginNode ? '🏳️' : ''}}
        {{ node === nodeGraph.endNode ? '🚩' : '' }}
      </div>
    </div>
  </div>
</template>

<script>
import { solveMaze } from './maze'

export default {
  data () {
    return {
      nodeGraph: null,
      width: 0,
      height: 0,
      path: [],
      current: null
    }
  },
  methods: {
    indexToPos (i) {
      let y = i % this.width
      let x = Math.floor(i / this.width)
      return { x, y }
    },
    cellStyle (i) {
      let { x, y } = this.indexToPos(i)
      return { left: `${y * 2.5}em`, top: `${x * 2.5}em` }
    },
    async reload (m) {
      let vm = this
      let { width, height } = vm
      let begin = [9, 0]
      let end = [0, 0]
      await solveMaze(m, width, height, begin, end, (nodeGraph, current, path) => {
        vm.current = current
        vm.nodeGraph = nodeGraph
        vm.path = path
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
    let vm = window.vm = this
    this.width = 10
    this.height = 10
    let m = [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    this.reload(m)
  }
}
</script>

<style>
.row {
  margin-bottom: 1em;
}
.div-matrix {
  position: relative;
}
.cell {
  border: 1px black solid;
  width: 2em;
  height: 2em;
  position:absolute;
  text-align: center;
}
.cell.path {
  border: 1px red solid;
}
.black {
  background: black;
}
.cell.queue {
  border: 2px blue solid;
}
</style>
