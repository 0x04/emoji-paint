import { Point } from '../classes/point.mjs'

export class Tool {
  canvas = null
  palette = null
  button = 0
  isMouseDown = false
  point = null
  prevPoint = null

  constructor(canvas, palette) {
    this.canvas = canvas
    this.palette = palette

    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }

  activate() {
    const { element } = this.canvas
    element.addEventListener('mousedown', this.onMouseDown)
    element.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('mouseup', this.onMouseUp)
  }

  deactivate() {
    const { element } = this.canvas
    element.removeEventListener('mousedown', this.onMouseDown)
    element.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseup', this.onMouseUp)
  }

  apply(event) {
    const point = this.canvas.mouseGrid.getPointFromEvent(event)

    this.prevPoint = this.point

    // Normalize coordinates outside the grid
    if (point.x < 0 || point.x >= this.canvas.width || point.y < 0 || point.y >= this.canvas.height) {
      this.point = new Point(
        Math.max(0, Math.min(point.x, this.canvas.width - 1)),
        Math.max(0, Math.min(point.y, this.canvas.height - 1))
      )
      return false
    }

    this.point = point

    return true
    // Implement in child class
  }

  onMouseDown(event) {
    this.button = event.button
    this.isMouseDown = true
    this.apply(event)
  }

  onMouseMove(event) {
    if (this.isMouseDown) {
      this.apply(event)
    }
  }

  onMouseUp() {
    if (this.isMouseDown) {
      this.isMouseDown = false
      this.point = null
      this.prevPoint = null
    }
  }
}
