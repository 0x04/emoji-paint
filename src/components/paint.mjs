import { Canvas } from './canvas.mjs'
import { Palette } from './palette.mjs'
import { DrawTool } from '../tools/draw-tool.mjs'
import { ToolbarTop } from './toolbar-top.mjs'
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../constants/globals.mjs'

export class Paint {
  storage = null
  canvas = null
  palette = null
  tool = null
  toolbars = { top: null }
  elements = { container: null, head: null, body: null }
  width = 10
  height = 10

  constructor(element = document.createElement('div'), stores) {
    if (!stores || !stores.canvas) {
      throw new Error('Argument `stores` must be defined!')
    }

    this.onCanvasStoreChange = this.onCanvasStoreChange.bind(this)

    const { canvas: canvasStore } = this.stores = stores

    this.canvas = new Canvas()
    this.palette = new Palette(this)
    this.tool = new DrawTool(this)
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

    canvasStore.subscribe(this.onCanvasStoreChange)
  }

  setup(width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
    const { canvas: canvasStore } = this.stores

    canvasStore.setDimensions(width, height)
    this.palette.setup()
    this.tool.activate()
  }

  onCanvasStoreChange(state, store) {
    this.canvas.setContent(store.getString())
  }
}
