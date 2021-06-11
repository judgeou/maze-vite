import { color_diff } from './color'
import Heap from 'heap-js'

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
  }
}

class NodeGraph {
  constructor (matrix, width, height, beginPos, endPos) {
    this.nodes = []
    this.matrix = matrix
    this.width = width
    this.height = height

    this.queue = new Heap((a, b) => {
      if (a.cost > b.cost) {
        return 1
      } else if (a.cost < b.cost) {
        return -1
      } else {
        return 0
      }
    })
    this.current = null
    
    this.beginPos = beginPos
    this.beginNode = null
    this.endPos = endPos
    this.endNode = null
  }

  buildNodeGraph () {
    let { width, height, beginPos, endPos } = this

    this.nodes = new Array(width * height)

    // 先处理 begin end
    this.beginNode = this.getNode(beginPos[0], beginPos[1])
    this.endNode = this.getNode(endPos[0], endPos[1])
  }

  getNode (x, y) {
    let { nodes, width, height, matrix } = this
    if (x >= 0 && y >= 0 && x < width && y < height) {
      let node = nodes[y * width + x]
      if (node === undefined) {
        let value = matrix[y * width + x]
        node = new Node(x, y, value)
        nodes[y * width + x] = node
      }
      return node
    } else {
      return null
    }
  }

  getNearNodes (node) {
    let { x, y } = node
    let up = this.getNode(x, y - 1)
    let down = this.getNode(x, y + 1)
    let left = this.getNode(x - 1, y)
    let right = this.getNode(x + 1, y)
    return [ up, down, left, right ].filter(node => node !== null)
  }

  popBestNextNode () {
    return this.queue.pop()
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

  while (node !== null) {
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

/**
 * 获取 Node 的 RGB 值
 * @param {Node} node 
 * @returns 
 */
function getNodeRGB (node) {
  let { value } = node
  let r = value & 0xFF
  let g = value >> 8 & 0xFF
  let b = value >> 16 & 0xFF
  return [ r, g, b ]
}

/**
 * 求两个节点的颜色差距
 * @param {Node} nodeA 
 * @param {Node} nodeB 
 * @returns 
 */
function getNodeColorDiff (nodeA, nodeB) {
  let rgbA = getNodeRGB(nodeA)
  let rgbB = getNodeRGB(nodeB)

  return color_diff(rgbA, rgbB)
}

async function solveMaze (matrix, width, height, begin, end, mode, cb = () => {}) {
  let path = []
  let nodeGraph = new NodeGraph(matrix, width, height, begin, end)
  nodeGraph.buildNodeGraph()
  
  nodeGraph.queue.push(nodeGraph.beginNode)

  while (nodeGraph.queue.length) {
    let current = nodeGraph.current = nodeGraph.popBestNextNode()
    current.checked = true

    let exit = await cb(nodeGraph, current, [], false)
    if (exit) { return }

    if (equalsNode(current, nodeGraph.endNode)) {
      path = buildPath(current)
      await cb(nodeGraph, current, path, true)
      return path
    }

    let nearNodes = nodeGraph.getNearNodes(current)
    for (let i = nearNodes.length - 1; i >= 0; i--) {
      let node = nearNodes[i]
      if (node.checked === false) {
        node.checked = true

        let colordiff = getNodeColorDiff(node, current)
        const colorDiffThreshold = 2 // 容许通过的颜色差异，范围 0~100

        node.parent = current
        node.endDistance = getDistance(node, nodeGraph.endNode)
        node.beginDistance = current.beginDistance + 1

        if (mode === "1") {
          node.cost = node.endDistance + node.beginDistance
        
          if (colordiff < colorDiffThreshold) {
            nodeGraph.queue.push(node)
          }
        } else if (mode === "2") {
          node.cost = node.endDistance + node.beginDistance + (colordiff * width * height)
          nodeGraph.queue.push(node)
        }
      }
    }
  }

  return path
}

export {
  solveMaze
}