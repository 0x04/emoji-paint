import { Metrics } from './metrics.mjs'
import { Rectangle } from '../classes/rectangle.mjs'
import { MouseGrid } from '../classes/mouse-grid.mjs'

export class Canvas {
  /**
   * @type {HTMLDivElement}
   */
  element = null
  /**
   * @type {Metrics}
   */
  metrics = null
  /**
   * @type {Rectangle}
   */
  rectangle = null
  /**
   * @type {MouseGrid}
   */
  mouseGrid = null

  constructor() {
    this.onResize = this.onResize.bind(this)

    this.metrics = new Metrics()

    this.element = document.createElement('div')
    this.element.classList.add('emoji-paint__canvas')
    this.element.addEventListener('contextmenu', (event) => event.preventDefault())

    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.element)
    this.onResize()
  }

  onResize() {
    this.metrics.measure()
    this.rectangle = new Rectangle(
      0,
      0,
      this.element.scrollWidth,
      this.element.scrollHeight
    )
    this.mouseGrid = new MouseGrid(this.rectangle, this.metrics.rectangle)
  }

  setContent(content) {
    this.element.innerText = content
  }
}
