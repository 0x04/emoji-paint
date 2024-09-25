import { DataStorage } from '../classes/data-storage.mjs'
import { Canvas } from './canvas.mjs'
import { Palette } from './palette.mjs'
import { DrawTool } from '../tools/draw-tool.mjs'
import { ToolbarTop } from './toolbar-top.mjs'

export class Paint {
  storage = null
  canvas = null
  palette = null
  tool = null
  toolbars = { top: null }
  elements = { container: null, head: null, body: null }
  width = 10
  height = 10

  constructor(element = document.createElement('div')) {
    this.storage = new DataStorage()
    this.canvas = new Canvas()
    this.palette = new Palette(this.storage)
    this.tool = new DrawTool(this.canvas, this.palette)
    this.toolbars.top = new ToolbarTop(this)

    const { elements } = this
    const container = elements.container = element
    const head = elements.head = document.createElement('div')
    const body = elements.body = document.createElement('div')

    container.classList.add('emoji-paint__container')

    head.classList.add('emoji-paint__head')
    head.innerText = '🎨 EmojiPaint'

    body.classList.add('emoji-paint__body')

    body.append(
      this.toolbars.top.element,
      this.canvas.element,
      this.palette.elements.container,
    )

    container.append(head, body)

    if (!this.elements.container.parentElement) {
      document.body.append(this.elements.container)
    }
  }

  setup(width = 10, height = 10) {
    this.width = width
    this.height = height

    this.canvas.setup(width, height)
    this.palette.setup()
    this.tool.activate()
  }
}
