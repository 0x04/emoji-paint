import { DEFAULT_BLANK } from '../constants/palettes.mjs'

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
    this.matrix = new Array(this.height)
      .fill(undefined)
      .map(() => new Array(this.width).fill(blank))
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

  toString() {
    return this.matrix.reduce(
      (result, line) => result + line.join('') + this.separator,
      ''
    )
  }
}
