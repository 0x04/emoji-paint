import { Point } from '../classes/point.mjs'

export const lineSimple = (pointA, pointB) => {
  const dx = pointB.x - pointA.x
  const dy = pointB.y - pointA.y
  const steps = Math.max(Math.abs(dx), Math.abs(dy))
  const xIncrement = dx / steps
  const yIncrement = dy / steps
  let result = []
  let x = pointA.x
  let y = pointA.y

  result.push(new Point(Math.round(x), Math.round(y)))

  for (let i = 0; i < steps; i++) {
    x += xIncrement
    y += yIncrement

    result.push(new Point(Math.round(x), Math.round(y)))
  }

  return result
}

// Bresenham's Line Algorithm
export const line = (pointA, pointB) => {
  let result = []
  let x0 = pointA.x
  let y0 = pointA.y
  let x1 = pointB.x
  let y1 = pointB.y
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = (x0 < x1) ? 1 : -1
  const sy = (y0 < y1) ? 1 : -1
  let err = dx - dy

  while (true) {
    result.push(new Point(x0, y0))

    if (x0 === x1 && y0 === y1) break

    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x0 += sx
    }
    if (e2 < dx) {
      err += dx
      y0 += sy
    }
  }

  return result
}
