import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_BLANK,
  DEFAULT_HEIGHT,
  DEFAULT_SEPARATOR,
  DEFAULT_WIDTH,
  STORE_STORAGE_KEY
} from '../constants/globals.mjs'
import { matchEmojis } from '../functions/match-emojis.mjs'
import { PersistentStore } from '../classes/persistent-store.mjs'
import { createMatrix, matrixToString, mergePointsIntoMatrix } from '../functions/matrix.mjs'

export class CanvasStore extends PersistentStore {
  /**
   * @type {{width: number, height: number, matrix: null, defaultBlank: string, backgroundColor: string}}
   */
  static initialState = {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    matrix: null,
    defaultBlank: DEFAULT_BLANK,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
  }

  constructor(read = true) {
    super(CanvasStore.initialState, `${STORE_STORAGE_KEY}.canvas`)
    this.state.matrix = this.create()

    if (read) {
      this.read()
    }
  }

  /**
   * Returns a canvas with the given dimensions.
   * @param width
   * @param height
   * @param defaultBlank
   * @returns {string[][]} The new canvas matrix
   */
  create(
    width = this.state.width,
    height = this.state.height,
    defaultBlank = this.state.defaultBlank
  ) {
    return createMatrix(width, height, defaultBlank)
  }

  /**
   * Clears the canvas matrix.
   */
  clear() {
    this.setProperty('matrix', this.create())
  }

  /**
   * Sets the given points in the canvas matrix to the given value.
   * @param {string} value
   * @param {...Point} points
   */
  setPoints(value, ...points) {
    const { matrix, width, height } = this.state
    const newMatrix = mergePointsIntoMatrix(
      structuredClone(matrix),
      width,
      height,
      value,
      ...points
    )

    this.setProperty('matrix', newMatrix)
  }

  /**
   * Returns the current dimensions of the canvas matrix.
   * @returns {{width: number, height: number}}
   */
  getDimensions() {
    const { width, height } = this.state
    return { width, height }
  }

  /**
   * Defines the dimensions of the canvas matrix. If one of the dimensions is larger than the current one, the new
   * fields are filled with the content of `blank`.
   * @param {number} width
   * @param {number} height
   * @param {string} [blank]
   */
  setDimensions(width, height, blank = this.state.defaultBlank) {
    if (width === this.state.width && height === this.state.height) {
      return
    }

    const oldMatrix = this.state.matrix
    const newMatrix = new Array(height).fill(undefined)

    for (let lineIndex = 0; lineIndex < newMatrix.length; lineIndex++) {
      const oldLine = oldMatrix.at(lineIndex)

      if (!oldLine) {
        newMatrix[lineIndex] = new Array(width).fill(blank)
        continue
      }

      if (oldLine.length < width) {
        newMatrix[lineIndex] = oldLine
          .concat(...blank.repeat(width - oldLine.length))
        continue
      }

      newMatrix[lineIndex] = oldLine.slice(0, width)
    }

    this.setState({ width, height, matrix: newMatrix })
  }

  /**
   * Returns the content of the canvas matrix as string.
   * @param {string} [separator] The line separator
   * @returns {string}
   */
  getString(separator = DEFAULT_SEPARATOR) {
    return matrixToString(this.state.matrix, separator)
  }

  /**
   * Sets the content of the canvas matrix from the given string.
   * @param {string} string
   * @param {string} [blank]
   * @param {string} [separator]
   */
  setString(string, blank = DEFAULT_BLANK, separator = DEFAULT_SEPARATOR) {
    const newMatrix = string
      .trim()
      .split(separator)
      .map((line) => matchEmojis(line))
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
