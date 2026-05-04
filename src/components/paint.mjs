import { Canvas } from './canvas.mjs'
import { Palette } from './palette.mjs'
import { DrawTool } from '../tools/draw-tool.mjs'
import { ToolbarTop } from './toolbar-top.mjs'
import { versionString } from '../constants/versionString.mjs'
import { CanvasStore } from '../stores/canvas-store.mjs'
import { PaletteStore } from '../stores/palette-store.mjs'

export class Paint {
  /**
   * The current app version
   * @type {string}
   */
  static version = versionString

  /**
   * @type {Canvas}
   */
  canvas = null
  /**
   * @type {Object}
   */
  stores = {}
  /**
   * @type {Palette}
   */
  palette = null
  /**
   * @type {Tool}
   */
  tool = null
  /**
   * @type {Object}
   * @property top {ToolbarTop}
   */
  toolbars = { top: null }
  elements = { container: null, head: null, body: null }
  width = 10
  height = 10

  constructor(element = document.createElement('div')) {
    this.onCanvasStoreChange = this.onCanvasStoreChange.bind(this)

    this.stores = {
      canvas: new CanvasStore(),
      palette: new PaletteStore()
    }

    const { canvas: canvasStore } = this.stores

    canvasStore.read()

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

  setup() {
    this.palette.setup()
    this.tool.activate()
  }

  applyBackground(color) {
    this.elements.container.style.setProperty(
      '--canvas-background',
      color
    )
  }

  onCanvasStoreChange(store) {
    if (store.hasChange('matrix')) {
      this.canvas.setContent(store.getString())
    }

    if (store.hasChange('backgroundColor')) {
      this.applyBackground(store.getProperty('backgroundColor'))
    }
  }
}
