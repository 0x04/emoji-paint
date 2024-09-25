import { DEFAULT_BLANK } from '../constants/palettes.mjs'
import { Rectangle } from '../classes/rectangle.mjs'

export class Metrics {
  rectangle = null
  element = null

  constructor(character = DEFAULT_BLANK) {
    this.element = document.createElement('div')
    this.element.classList.add('emoji-paint__metrics')
    this.element.innerText = character
  }

  measure() {
    document.body.appendChild(this.element)
    this.rectangle = new Rectangle(0, 0, this.element.offsetWidth, this.element.offsetHeight)
    document.body.removeChild(this.element)

    return this.rectangle
  }
}
