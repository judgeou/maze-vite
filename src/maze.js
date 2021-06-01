class Node {
  constructor (x, y, value) {
    this.x = x
    this.y = y
    this.value = value
    this.checked = false
    this.parent = null
    this.nearNodes = []
  }
}

class NodeGraph {
  constructor (matrix, width, height, beginPos, endPos) {
    this.nodes = []
    this.matrix = matrix
    this.width = width
    this.height = height

    this.queue = []
    this.current = null
    
    this.beginPos = beginPos
    this.beginNode = null
    this.endPos = endPos
    this.endNode = null
  }

  buildNodeGraph () {
    let { width, height, beginPos, endPos } = this
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let node = this.getNode(x, y)

        if (x === beginPos[0] && y === beginPos[1]) {
          this.beginNode = node
        }
        if (x === endPos[0] && y === endPos[1]) {
          this.endNode = node
        }

        let up = this.getNode(x, y - 1)
        let down = this.getNode(x, y + 1)
        let left = this.getNode(x - 1, y)
        let right = this.getNode(x + 1, y)
        node.nearNodes = [ up, down, left, right].filter(node => node)
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

  switchNodeValue (node) {
    node.value = !node.value
  }

  setEndNode (node) {
    for (let node of this.nodes) {
      node.checked = false
      node.parent = null
    }
    this.queue = this.current.nearNodes.filter(node => node.value)
    this.endNode = node
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function buildPath (endNode) {
  let path = []
  let node = endNode

  while (node) {
    path.push(node)
    node = node.parent
  }

  return path
}

function equalsNode (a, b) {
  return a.x === b.x && a.y === b.y
}

async function solveMaze (matrix, width, height, begin, end, cb = () => {}) {
  let path = []
  let nodeGraph = new NodeGraph(matrix, width, height, begin, end)
  nodeGraph.buildNodeGraph()

  nodeGraph.queue = [ nodeGraph.beginNode ]

  while (nodeGraph.queue.length) {
    let current = nodeGraph.current = nodeGraph.queue.shift()
    current.checked = true

    path = buildPath(current)
    cb(nodeGraph, current, path)

    if (equalsNode(current, nodeGraph.endNode)) {
      while (equalsNode(current, nodeGraph.endNode)) {
        await sleep(1000)
      }
      continue
    }

    for (let node of current.nearNodes) {
      if (node.checked === false && node.value) {
        node.parent = current
        nodeGraph.queue.push(node)
      }
    }

    await sleep(500)
  }

  return path
}

export {
  solveMaze
}