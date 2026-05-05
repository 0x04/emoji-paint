export class Point {
  static isSame(a, b) {
    return a && b && a.x === b.x && a.y === b.y
  }

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

  isSame(point) {
    return Point.isSame(this, point)
  }
}
