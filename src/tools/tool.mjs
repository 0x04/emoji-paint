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

    if (!point || point.x > this.canvas.width - 1 || point.y > this.canvas.height - 1) {
      return false
    }

    this.prevPoint = this.point
    this.point = point

    return !!this.point
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
