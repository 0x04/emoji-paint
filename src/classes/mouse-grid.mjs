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

  getPointFromCoordinate(x, y) {
    return new Point(
      Math.floor(x / this.cellRect.width),
      Math.floor(y / this.cellRect.height)
    )
  }

  getPointFromEvent(event) {
    const { scrollTop, scrollLeft } = event.target

    return this.getPointFromCoordinate(
      scrollLeft + event.offsetX - this.gridRect.x,
      scrollTop + event.offsetY - this.gridRect.y
    )
  }
}
