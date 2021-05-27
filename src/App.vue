<template>
  <div>
    <div class="div-matrix">
      <div v-for="(row, x) in matrix" :key="x">
        <div class="cell" 
          :class="{ black: p <= 0, path: isPath(x, y) }"
          v-for="(p, y) in row" :key="y" :style="{ left: `${y * 2.5}em`, top: `${x * 2.5}em` }">
          {{ begin[0] === x && begin[1] === y ? 'B' : '' }}
          {{ end[0] === x && end[1] === y ? 'E' : '' }}
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
      paths: []
    }
  },
  methods: {
    isPath (x, y) {
      const p = this.paths.find(path => path[0] === x && path[1] === y)
      return p
    }
  },
  created () {
    const m = this.matrix = [
      [1, 1, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 1, 1]
    ]
    this.paths = solveMaze(m, this.begin, this.end)
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
</style>
