<template>
  <div>
    <div class="div-matrix">
      <div class="cell"
        v-for="(node, i) in nodes" :key="i"
        :class="{ black: node.value <= 0, path: isPath(i), queue: queue.indexOf(node) >= 0 }"
        :style="cellStyle(i)">

        {{ node === current ? '😋' : '' }}
      </div>
    </div>
  </div>
</template>

<script>
import { solveMaze } from './maze'

export default {
  data () {
    return {
      begin: [0, 0],
      end: [3, 4],
      nodes: [],
      width: 0,
      height: 0,
      paths: [],
      queue: [],
      current: null
    }
  },
  methods: {
    isPath (x, y) {

    },
    indexToPos (i) {
      let y = i % this.width
      let x = Math.floor(i / this.width)
      return { x, y }
    },
    cellStyle (i) {
      let { x, y } = this.indexToPos(i)
      return { left: `${y * 2.5}em`, top: `${x * 2.5}em` }
    }
  },
  async created () {
    let vm = this
    const m = [
      1, 1, 0, 0, 0,
      1, 1, 1, 1, 1,
      0, 1, 0, 1, 0,
      0, 1, 0, 1, 1
    ]
    const width = this.width = 5
    const height = this.height = 4
    this.paths = await solveMaze(m, width, height, this.begin, this.end, (nodes, current, queue) => {
      vm.current = current
      vm.queue = queue
      vm.nodes = nodes
    })
  }
}
</script>

<style>
.top {
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
