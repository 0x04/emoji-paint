export const createMatrix = (width, height, blank = ' ') => new Array(height)
  .fill(undefined)
  .map(() => new Array(width).fill(blank))

export const matrixToString = (matrix, separator = '\n') => matrix
  .reduce(
    (result, line) => result + line.join('') + separator,
    ''
  )

export const mergePointsIntoMatrix = (matrix, width, height, value, ...points) => {
  points.forEach(point => {
    if (point.x < 0 && point.x >= width && point.y < 0 || point.y >= height) {
      throw new RangeError('Coordinates are outside the canvas area!')
    }

    matrix[point.y][point.x] = value
  })

  return matrix
}
