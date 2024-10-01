import { Point } from './point.mjs'

export class Rectangle extends Point {
  /**
   * @type {number}
   */
  width = 0
  /**
   * @type {number}
   */
  height = 0

  constructor(x = 0, y = 0, width = 0, height = 0) {
    super(x, y)
    this.width = width
    this.height = height
  }

  clone() {
    return new Rectangle(this.x, this.y, this.width, this.height)
  }
}
