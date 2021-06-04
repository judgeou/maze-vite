class Node {
  constructor (x, y, value) {
    this.x = x
    this.y = y
    this.value = value
    this.cost = 0
    this.beginDistance = 0
    this.endDistance = 0
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
    let { nodes, width, height, matrix } = this
    if (x >= 0 && y >= 0 && x < width && y < height) {
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

  popBestNextNode () {
    let { queue } = this
    let bestNode = queue[0]
    let bestNodeIndex = 0
    let { length } = queue

    for (let i = 0; i < length; i++) {
      let node = queue[i]
      if (node.cost < bestNode.cost) {
        bestNode = node
        bestNodeIndex = i
      }
    }

    queue.splice(bestNodeIndex, 1)
    return bestNode
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

function getDistance (nodeA, nodeB) {
  const x = Math.abs(nodeB.x - nodeA.x)
  const y = Math.abs(nodeB.y - nodeA.y)
  return (x + y)
}

async function solveMaze (matrix, width, height, begin, end, cb = () => {}) {
  let path = []
  let nodeGraph = new NodeGraph(matrix, width, height, begin, end)
  nodeGraph.buildNodeGraph()
  
  nodeGraph.queue = [ nodeGraph.beginNode ]

  while (nodeGraph.queue.length) {
    let current = nodeGraph.current = nodeGraph.popBestNextNode()
    current.checked = true

    path = buildPath(current)
    cb(nodeGraph, current, path)

    if (equalsNode(current, nodeGraph.endNode)) {
      while (equalsNode(current, nodeGraph.endNode)) {
        await sleep(1000)
      }
      nodeGraph.queue = [ current ]
      nodeGraph.beginNode = current
      continue
    }

    for (let node of current.nearNodes) {
      if (node.checked === false && node.value) {
        node.parent = current
        node.checked = true
        node.endDistance = getDistance(node, nodeGraph.endNode)
        node.beginDistance = current.beginDistance + 1
        node.cost = node.endDistance + node.beginDistance
        nodeGraph.queue.push(node)
      }
    }

    await sleep(0)
  }

  return path
}

export {
  solveMaze
}