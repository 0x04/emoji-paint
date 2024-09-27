import { Metrics } from './metrics.mjs'
import { Rectangle } from '../classes/rectangle.mjs'
import { MouseGrid } from '../classes/mouse-grid.mjs'

export class Canvas {
  metrics = null
  element = null
  rectangle = null
  mouseGrid = null

  constructor() {
    this.metrics = new Metrics()

    this.element = document.createElement('div')
    this.element.classList.add('emoji-paint__canvas')
    this.element.addEventListener('contextmenu', (event) => event.preventDefault())
  }

  setContent(content) {
    const { element, metrics } = this

    metrics.measure()

    element.innerText = content

    // TODO: This should only happen on dimension change
    this.rectangle = new Rectangle(0, 0, element.scrollWidth, element.scrollHeight)
    this.mouseGrid = new MouseGrid(this.rectangle, metrics.rectangle)
  }
}
