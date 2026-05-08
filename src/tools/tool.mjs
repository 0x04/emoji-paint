import { Point } from '../classes/point.mjs'

export class Tool {
  /**
   * @type {Canvas}
   */
  canvas = null
  /**
   * @type {{canvas, palette}}
   * @property {CanvasStore} canvas
   * @property {PaletteStore} palette
   */
  stores = { canvas: null, palette: null }
  button = 0
  isMouseDown = false
  point = null
  prevPoint = null
  pointsToDraw = []

  /**
   * @type {{matrix: Array<string[]>, width: number, height: number}|null}
   */
  current = null

  constructor(canvas, canvasStore, paletteStore) {
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)

    this.canvas = canvas
    this.stores = { canvas: canvasStore, palette: paletteStore }
  }

  getValue(button = this.button) {
    return this.stores.palette.getSelectedEntry(button)
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

  /**
   * Implement functionality in a child class
   * @param {MouseEvent} event
   * @returns {boolean}
   */
  draw(event) {
    const { width, height } = this.stores.canvas.getDimensions()

    this.prevPoint = this.point
    const point = this.point = this.canvas.mouseGrid.getPointFromEvent(event)

    if (this.point.isSame(this.prevPoint)) {
      return false
    }

    // Normalize coordinates outside the grid
    if (point.x < 0 || point.x >= width || point.y < 0 || point.y >= height) {
      this.point = new Point(
        Math.max(0, Math.min(point.x, width - 1)),
        Math.max(0, Math.min(point.y, height - 1))
      )
      return false
    }

    return true
  }

  apply() {
    this.stores.canvas.setPoints(
      this.getValue(),
      ...this.pointsToDraw
    )
    this.pointsToDraw = []
    this.stores.canvas.write()
  }

  onMouseDown(event) {
    const { canvas: canvasStore } = this.stores

    this.button = event.button
    this.isMouseDown = true
    this.current = {
      matrix: structuredClone(canvasStore.getProperty('matrix')),
      width: canvasStore.getProperty('width'),
      height: canvasStore.getProperty('height')
    }
    this.draw(event)
  }

  onMouseMove(event) {
    if (this.isMouseDown) {
      this.draw(event)
    }
  }

  onMouseUp() {
    if (this.isMouseDown) {
      this.isMouseDown = false
      this.point = null
      this.prevPoint = null
      this.current = null
      this.apply()
    }
  }
}
