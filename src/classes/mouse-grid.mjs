import { Point } from './point.mjs'

export class MouseGrid {
  gridRect = null
  cellRect = null

  constructor(gridRect = null, cellRect = null) {
    this.setup(gridRect, cellRect)
  }

  setup(gridRect, cellRect) {
    this.gridRect = gridRect
    this.cellRect = cellRect
  }

  isValidCoordinate(x, y) {
    return (x >= 0 && x <= this.gridRect.width
      && y >= 0 && y <= this.gridRect.height)
  }

  getPointFromCoordinate(x, y) {
    if (!this.isValidCoordinate(x, y)) {
      return null
    }

    return new Point(
      Math.floor(x / this.cellRect.width),
      Math.floor(y / this.cellRect.height)
    )
  }

  getPointFromEvent(event) {
    return this.getPointFromCoordinate(
      event.offsetX - this.gridRect.x,
      event.offsetY - this.gridRect.y
    )
  }
}
