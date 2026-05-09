import { Canvas } from './canvas.mjs'
import { Palette } from './palette.mjs'
import { DrawTool } from '../tools/draw-tool.mjs'
import { ToolbarTop } from './toolbar-top.mjs'
import { versionString } from '../constants/versionString.mjs'
import { CanvasStore } from '../stores/canvas-store.mjs'
import { PaletteStore } from '../stores/palette-store.mjs'
import { UndoRedoStore } from '../stores/undo-redo-store.js'

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

  constructor(element = document.createElement('div')) {
    this.onCanvasStoreChange = this.onCanvasStoreChange.bind(this)

    const canvasStore = new CanvasStore()
    const paletteStore = new PaletteStore()
    const undoRedoStore = new UndoRedoStore(canvasStore)

    this.stores = {
      canvas: canvasStore,
      palette: paletteStore,
      undoRedo: undoRedoStore
    }

    this.canvas = new Canvas()
    this.palette = new Palette(paletteStore)
    this.tool = new DrawTool(this.canvas, canvasStore, paletteStore)
    this.toolbars.top = new ToolbarTop(canvasStore, undoRedoStore)

    const body = this.elements.body = document.createElement('div')
    body.classList.add('emoji-paint__body')
    body.append(
      this.toolbars.top.element,
      this.canvas.element,
      this.palette.elements.container,
    )

    const container = this.elements.container = element
    container.classList.add('emoji-paint__container')
    container.append(body)

    if (!container.parentElement) {
      document.body.append(container)
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
