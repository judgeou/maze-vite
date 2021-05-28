class Node {
  constructor (x, y, value) {
    this.x = x
    this.y = y
    this.value = value
    this.checked = false
    this.nearNodes = []
  }
}

class NodeGraph {
  constructor (matrix, width, height) {
    this.nodes = []
    this.matrix = matrix
    this.width = width
    this.height = height
  }

  buildNodeGraph () {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let node = getNode(x, y)
  
        let up = getNode(x, y - 1)
        let down = getNode(x, y + 1)
        let left = getNode(x - 1, y)
        let right = getNode(x + 1, y)
        node.nearNodes = [ up, down, left, right].filter(node => node && node.value === 1)
      }
    }
  
    return nodeGraph
  }

  getNode (x, y) {
    let { nodes, width, matrix } = this
    if (x >= 0 && y >= 0) {
      let node = nodes[y * width + x]
      if (!node) {
        let value = matrix[y * width + x]
        node = new Node(x, y, value)
        nodes[y * width + x] = node
      }
      return node
    } else {
      return null
    }
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getPoint(m, x, y) {
  if (x >= 0 && y >= 0 && x < m.length && y < m[x].length) {
    return m[x][y]
  } else {
    return 0
  }
}

function isSamePoint (p1, p2) {
  return p1[0] === p2[0] && p1[1] === p2[1]
}

async function solveMaze (matrix, width, height, begin, end, cb = (current, queue) => {}) {
  let path = []
  let nodeGraph = new NodeGraph(matrix, width, height)
  let queue = [ nodeGraph.getNode(begin[0], begin[1]) ]

  while (queue.length && queue.length < 200) { // 队列太长就算了，退出吧
    let current = queue.shift()
    current.checked = true

    if (isSamePoint([ current.x, current.y ], end)) {
      break
    }

    for (let node of current.nearNodes) {
      queue.push(node)
    }

    cb(current, queue)
    await sleep(1000)
  }

  return path
}

export {
  solveMaze
}