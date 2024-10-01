export class Point {
  /**
   * @type {number}
   */
  x = 0
  /**
   * @type {number}
   */
  y = 0

  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  clone() {
    return new Point(this.x, this.y)
  }
}
