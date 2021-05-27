function getPoint(m, x, y) {
  if (x >= 0 && y >= 0 && x < m.length && y < m[x].length) {
    return m[x][y]
  } else {
    return 0
  }
}

function getNextPoint(m, current, lastPoint) {
  let [x, y] = current
  let nextPoint = [
    [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]
  ].find(p => {
    let r1 = getPoint(m, p[0], p[1]) > 0
    let r2 = !isSamePoint(p, lastPoint)
    return r1 && r2
  })
  return nextPoint
}

function isSamePoint (p1, p2) {
  return p1[0] === p2[0] && p1[1] === p2[1]
}

function solveMaze (matrix, begin, end) {
  let path = []

  // 当前点
  let current = begin
  path.push(current)

  // 上次走过的路
  let lastPoint = begin

  // 随便挑一个可以走的点
  while (1) {
    if (isSamePoint(current, end)) {
      break
    }

    let validPoint = getNextPoint(matrix, current, lastPoint)

    path.push(validPoint)
    lastPoint = current
    current = validPoint
  }
  return path
}

export {
  solveMaze
}