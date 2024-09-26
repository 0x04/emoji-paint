import { DEFAULT_BLANK } from '../constants/palettes.mjs'
import { splitEmoji } from '../functions/split-emojis.mjs'

export class Data {
  width = 10
  height = 10
  blank = DEFAULT_BLANK
  separator = '\n'
  matrix = null

  setup(
    width = this.width,
    height = this.height,
    blank = this.blank,
    separator = this.separator
  ) {
    this.width = width
    this.height = height
    this.blank = blank
    this.separator = separator

    const matrix = new Array(this.height)
      .fill(undefined)
      .map(() => new Array(this.width).fill(blank))

    this.matrix = this.merge(matrix)
  }

  merge(newMatrix) {
    if (this.matrix instanceof Array) {
      for (
        let index = 0, length = Math.min(this.matrix.length, newMatrix.length);
        index < length;
        index++
      ) {
        const linePrev = this.matrix[index]
        const lineCurr = newMatrix[index]

        newMatrix[index] = [
          ...linePrev.slice(0, lineCurr.length),
          ...lineCurr.slice(linePrev.length)
        ]
      }
    }

    return newMatrix
  }

  clear() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.matrix[y][x] = this.blank
      }
    }
  }

  set(x, y, value) {
    if (x >= 0 && x < this.width && y >= 0 || y < this.height) {
      this.matrix[y][x] = value
    } else throw new RangeError('out of range!')
  }

  setFromString(value) {
    // TODO: Improve implementation
    this.matrix = value
      .trim()
      .split(this.separator)
      .filter((line) => !(/^(?:#|\/\/)/.test(line)))
      .map((line) => splitEmoji(line))

    const width = this.matrix.reduce((prev, curr) => Math.max(prev, curr.length), 0)
    const height = this.matrix.length

    this.setup(width, height)
  }

  toString() {
    return this.matrix.reduce(
      (result, line) => result + line.join('') + this.separator,
      ''
    )
  }
}
