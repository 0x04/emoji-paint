import { Data } from '../classes/data.mjs'
import { Metrics } from './metrics.mjs'
import { Rectangle } from '../classes/rectangle.mjs'
import { MouseGrid } from '../classes/mouse-grid.mjs'

export class Canvas {
  data = null
  metrics = null
  width = 0
  height = 0
  element = null
  rectangle = null
  mouseGrid = null

  constructor(width = this.width, height = this.height) {
    this.data = new Data()
    this.metrics = new Metrics()

    this.element = document.createElement('div')
    this.element.classList.add('emoji-paint__canvas')
    this.element.addEventListener('contextmenu', (event) => event.preventDefault())

    this.setup(width, height)
  }

  setup(width, height) {
    this.width = width
    this.height = height

    const { element, data, metrics } = this

    data.setup(this.width, this.height)
    metrics.measure()

    element.innerText = data.toString()

    this.rectangle = new Rectangle(0, 0, element.scrollWidth, element.scrollHeight)
    this.mouseGrid = new MouseGrid(this.rectangle, this.metrics.rectangle)
  }

  draw(value, ...points) {
    points.forEach((point) => this.data.set(point.x, point.y, value))
    this.element.innerText = this.data.toString()
  }

  clear() {
    if (confirm('Are you sure?')) {
      this.data.clear()
      this.element.innerText = this.data.toString()
    }
  }
}
