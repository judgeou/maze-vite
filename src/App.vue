<template>
  <div>
    <div class="div-matrix">
      <div v-for="(row, x) in matrix" :key="x">
        <div class="cell" 
          :class="{ black: p <= 0, path: isPath(x, y), queue: isQueue(x, y) }"
          v-for="(p, y) in row" :key="y" :style="{ left: `${y * 2.5}em`, top: `${x * 2.5}em` }">

          {{ isCurrent(x, y) ? '😋' : '' }}
        </div>
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
      matrix: [],
      width: 0,
      height: 0,
      paths: [],
      queue: [],
      current: [0, 0]
    }
  },
  methods: {
    isPath (x, y) {
      const p = this.paths.find(path => path[0] === x && path[1] === y)
      return p
    },
    isCurrent (x, y) {
      return this.current.x === x && this.current.y === y
    },
    isQueue (x, y) {
      return this.queue.find(node => node.x === x && node.y === y)
    }
  },
  async created () {
    let vm = this
    const m = this.matrix = [
      1, 1, 0, 0, 0,
      1, 1, 1, 1, 1,
      0, 1, 0, 1, 0,
      0, 1, 0, 1, 1
    ]
    const width = this.width = 5
    const height = this.height = 4
    this.paths = await solveMaze(m, width, height, this.begin, this.end, (current, queue) => {
      vm.current = current
      vm.queue = queue
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
