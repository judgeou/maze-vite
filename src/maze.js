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
    let { width, height } = this
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let node = this.getNode(x, y)
  
        let up = this.getNode(x, y - 1)
        let down = this.getNode(x, y + 1)
        let left = this.getNode(x - 1, y)
        let right = this.getNode(x + 1, y)
        node.nearNodes = [ up, down, left, right].filter(node => node && node.value === 1)
      }
    }
  }

  getNode (x, y) {
    let { nodes, width, matrix } = this
    if (x >= 0 && y >= 0) {
      let node = nodes[y * width + x]
      if (!node) {
        let value = matrix[y * width + x]
        if (value !== undefined) {
          node = new Node(x, y, value)
          nodes[y * width + x] = node
        }
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

async function solveMaze (matrix, width, height, begin, end, cb = (nodes, current, queue) => {}) {
  let path = []
  let nodeGraph = new NodeGraph(matrix, width, height)
  nodeGraph.buildNodeGraph()

  let beginNode = nodeGraph.getNode(begin[0], begin[1])
  let endNode = nodeGraph.getNode(end[0], end[1])

  let queue = [ beginNode ]

  while (queue.length && queue.length) {
    let current = queue.shift()
    current.checked = true

    if (current === endNode) {
      break
    }

    for (let node of current.nearNodes) {
      if (node.checked === false) {
        queue.push(node)
      }
    }

    cb(nodeGraph.nodes, current, queue)
    await sleep(1000)
  }

  return path
}

export {
  solveMaze
}