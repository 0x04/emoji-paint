import { Store } from '../classes/store.mjs'

import { DEFAULT_BLANK, DEFAULT_HEIGHT, DEFAULT_SEPARATOR, DEFAULT_WIDTH } from '../constants/globals.mjs'
import { splitEmoji } from '../functions/split-emojis.mjs'

export class CanvasStore extends Store {
  static initialState = {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    matrix: null,
  }

  constructor() {
    super(CanvasStore.initialState)
    this.state.matrix = this.create()
  }

  create(
    width = this.state.width,
    height = this.state.height,
    blank = DEFAULT_BLANK
  ) {
    return new Array(height)
      .fill(undefined)
      .map(() => new Array(width).fill(blank))
  }

  clear() {
    this.setState({ ...{ matrix: this.create() } })
  }

  setPoints(value, ...points) {
    const { width, height } = this.state
    const newMatrix = structuredClone(this.state.matrix)

    points.forEach(point => {
      if (point.x < 0 && point.x >= width && y < 0 || point.y >= height) {
        throw new RangeError('Coordinates are outside the canvas area!')
      }

      newMatrix[point.y][point.x] = value
    })

    this.setState({ ...{ matrix: newMatrix } })
  }

  getDimensions() {
    const { width, height } = this.state
    return { width, height }
  }

  setDimensions(width, height, blank = DEFAULT_BLANK) {
    if (width === this.state.width && height === this.state.height) {
      return
    }

    const oldMatrix = this.state.matrix
    const newMatrix = new Array(height).fill(undefined)

    for (let lineIndex = 0; lineIndex < newMatrix.length; lineIndex++) {
      const oldLine = oldMatrix.at(lineIndex)

      if (!oldLine) {
        newMatrix[lineIndex] = new Array(width).fill(DEFAULT_BLANK)
        continue
      }

      if (oldLine.length < width) {
        newMatrix[lineIndex] = oldLine
          .concat(new Array(width - oldLine.length).fill(DEFAULT_BLANK))
        continue
      }

      newMatrix[lineIndex] = oldLine.slice(0, width)
    }

    this.setState({ width, height, matrix: newMatrix })
  }

  getString(separator = DEFAULT_SEPARATOR) {
    return this.state.matrix.reduce(
      (result, line) => result + line.join('') + separator,
      ''
    )
  }

  setString(string, blank = DEFAULT_BLANK, separator = DEFAULT_SEPARATOR) {
    const newMatrix = string
      .trim()
      .split(separator)
      .map((line) => splitEmoji(line))
      .filter((line) => line.length > 0)

    const width = newMatrix.reduce(
      (prev, curr) => Math.max(prev, curr.length),
      0
    )
    const height = newMatrix.length

    for (let lineIndex = 0; lineIndex < newMatrix.length; lineIndex++) {
      const newLine = newMatrix[lineIndex]

      if (newLine.length < width) {
        newLine.splice(
          newLine.length,
          0,
          ...new Array(width - newLine.length).fill(blank)
        )
      }
    }

    this.setState({ ...{ width, height, matrix: newMatrix } })
  }
}
