class Node {
  constructor ({x, y, value}) {
    this.x = x
    this.y = y
    this.value = value
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function toNode (matrix, point) {
  return new Node({ x: point[0], y: point[1], value: getPoint(matrix, point[0], point[1])})
}

function getPoint(m, x, y) {
  if (x >= 0 && y >= 0 && x < m.length && y < m[x].length) {
    return m[x][y]
  } else {
    return 0
  }
}

function getNearNodes (matrix, current) {
  let up = toNode(matrix, [ current.x, current.y - 1 ])

  let down = toNode(matrix, [ current.x, current.y + 1 ])

  let left = toNode(matrix, [ current.x - 1, current.y ])

  let right = toNode(matrix, [ current.x + 1, current.y ])

  return [ up, down, left, right].filter(node => node.value === 1)
}

function isSamePoint (p1, p2) {
  return p1[0] === p2[0] && p1[1] === p2[1]
}

async function solveMaze (matrix, begin, end, cb = (current, queue) => {}) {
  let path = []
  let queue = [ toNode(matrix, begin) ]

  while (queue.length && queue.length < 200) { // 队列太长就算了，退出吧
    let current = queue.shift()

    if (isSamePoint([ current.x, current.y ], end)) {
      break
    }

    let nodes = getNearNodes(matrix, current)

    for (let node of nodes) {
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