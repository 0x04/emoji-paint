import { Toolbar } from './toolbar.mjs'
import { copyToClipboard } from '../functions/copy-to-clipboard.mjs'
import { isEmoji } from '../functions/is-emoji.mjs'
import { matchEmojis } from '../functions/match-emojis.mjs'
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../constants/globals.mjs'

export class ToolbarTop extends Toolbar {
  elements = {
    btnUndo: null,
    btnRedo: null,
    btnBlank: null,
    resizeInputWidth: null,
    resizeInputHeight: null
  }
  /**
   * @type {CanvasStore}
   */
  canvasStore = null
  /**
   * @type {UndoRedoStore}
   */
  undoRedoStore = null

  constructor(canvasStore, undoRedoStore) {
    super('emoji-paint__toolbar-top')

    this.onCanvasStoreChange = this.onCanvasStoreChange.bind(this)
    this.onUndoRedoStoreChange = this.onUndoRedoStoreChange.bind(this)

    this.canvasStore = canvasStore
    this.undoRedoStore = undoRedoStore
    this.setup()
    this.canvasStore.subscribe(this.onCanvasStoreChange)
    this.undoRedoStore.subscribe(this.onUndoRedoStoreChange)
  }

  onCanvasStoreChange(store) {
    if (store.hasChange('width', 'height')) {
      this.elements.resizeInputWidth.value = store.getProperty('width')
      this.elements.resizeInputHeight.value = store.getProperty('height')
    }

    if (store.hasChange('defaultBlank')) {
      this.elements.btnBlank.innerText = store.getProperty('defaultBlank')
    }
  }

  onUndoRedoStoreChange(store) {
    if (store.hasChange('currentIndex')) {
      this.elements.btnUndo.disabled = !store.canUndo
      this.elements.btnRedo.disabled = !store.canRedo
    }
  }

  setup() {
    this.setupUndoRedo()
    this.appendSeparator()
    this.setupBtnCopy()
    this.appendSeparator()
    this.setupDownloadUpload()
    this.appendSpacer()
    this.setupBackgroundColor()
    this.appendSeparator()
    this.setupDefaultBlank()
    this.appendSeparator()
    this.setupResize()
    this.appendSeparator()
    this.setupBtnClear()
  }

  setupResize() {
    const inputWidth = this.elements.resizeInputWidth = document.createElement('input')
    inputWidth.classList.add('radius--left')
    inputWidth.title = 'Canvas width'
    inputWidth.type = 'number'
    inputWidth.value = String(DEFAULT_WIDTH)

    const inputHeight = this.elements.resizeInputHeight = document.createElement('input')
    inputHeight.classList.add('radius--middle')
    inputHeight.title = 'Canvas height'
    inputHeight.value = String(DEFAULT_HEIGHT)
    inputHeight.type = 'number'

    const btnResize = document.createElement('button')
    btnResize.classList.add(
      'emoji-paint__toolbar-top-btn-resize',
      'emoji-paint__btn-icon',
      'radius--right'
    )
    btnResize.title = 'Resize canvas'
    btnResize.innerText = '📐'
    btnResize.addEventListener('click', () => {
      this.canvasStore.setDimensions(
        parseInt(inputWidth.value),
        parseInt(inputHeight.value)
      )
      this.canvasStore.write()
    })

    const controls = document.createElement('div')
    controls.append(inputWidth, inputHeight, btnResize)

    const label = document.createElement('label')
    label.classList.add('emoji-paint__toolbar-label')
    label.title = 'Canvas size'
    label.innerText = 'Size'
    label.append(controls)

    const container = document.createElement('div')
    container.classList.add('emoji-paint__toolbar-top-resize')
    container.append(label)

    this.appendItem('resize', container)
  }

  setupBtnClear() {
    const btnClear = document.createElement('button')
    btnClear.classList.add(
      'emoji-paint__toolbar-top-btn-clear',
      'emoji-paint__btn-icon'
    )
    btnClear.title = 'Clear Canvas'
    btnClear.innerText = '💥️'
    btnClear.addEventListener('click', () => {
      this.canvasStore.clear()
      this.canvasStore.write()
    })

    this.appendItem('btnCopy', btnClear)
  }

  setupBtnCopy() {
    const btnCopy = document.createElement('button')
    btnCopy.classList.add(
      'emoji-paint__toolbar-top-btn-copy',
      'emoji-paint__btn-icon'
    )
    btnCopy.title = 'Copy to Clipboard'
    btnCopy.innerText = '📋'
    btnCopy.addEventListener('click', () => {
      copyToClipboard(this.canvasStore.getString())
    })

    this.appendItem('btnCopy', btnCopy)
  }

  setupDownloadUpload() {
    const btnDownload = document.createElement('button')
    btnDownload.classList.add(
      'emoji-paint__toolbar-top-btn-download',
      'emoji-paint__btn-icon',
      'radius--left'
    )
    btnDownload.title = 'Download'
    btnDownload.innerText = '⬇️'
    btnDownload.addEventListener('click', () => {
      const blob = new Blob([ this.canvasStore.getString() ], { type: 'text/plain' })
      const anchor = document.createElement('a')

      anchor.download = 'emoji-paint.txt'
      anchor.href = URL.createObjectURL(blob)

      document.body.append(anchor)

      anchor.click()
      anchor.remove()
    })

    const inputUpload = document.createElement('input')
    inputUpload.classList.add('emoji-paint__toolbar-top-btn-upload--input')
    inputUpload.type = 'file'
    inputUpload.title = 'Upload'
    inputUpload.addEventListener('change', () => {
      const [ file ] = inputUpload.files
      const fileReader = new FileReader()

      fileReader.addEventListener('load', () => {
        this.canvasStore.setString(fileReader.result)
        this.canvasStore.write()
      })
      fileReader.readAsText(file)
    })

    const btnUpload = document.createElement('button')
    btnUpload.classList.add(
      'emoji-paint__toolbar-top-btn-upload',
      'emoji-paint__btn-icon',
      'radius--right'
    )
    btnUpload.title = 'Upload'
    btnUpload.append('⬆️', inputUpload)

    const container = document.createElement('div')
    container.classList.add('emoji-paint__toolbar-top-download-upload')
    container.append(btnDownload, btnUpload)

    this.appendItem('downloadUpload', container)
  }

  setupBackgroundColor() {
    const input = document.createElement('input')
    input.type = 'color'
    input.value = this.canvasStore.getProperty('backgroundColor')
    input.addEventListener('change', () => {
      this.canvasStore.setProperty('backgroundColor', input.value)
      this.canvasStore.write()
    })

    const label = document.createElement('label')
    label.classList.add('emoji-paint__toolbar-label')
    label.append('Background', ' ', input)

    const container = document.createElement('div')
    container.title = 'Background color'
    container.classList.add('emoji-paint__toolbar-top-background-color')
    container.append(label)

    this.appendItem('background', container)
  }

  setupDefaultBlank() {
    const defaultBlank = this.canvasStore.getProperty('defaultBlank')

    const button = this.elements.btnBlank = document.createElement('button')
    button.innerText = defaultBlank
    button.addEventListener('click', () => {
      // NOTE: For the moment a very basic solution. The first idea of using a
      // text input didn't work because of the internal handling of the
      // `input` event while entering emojis in windows.
      const userInput = prompt('Enter a emoji character', defaultBlank)

      if (!userInput) {
        return
      }

      const value = matchEmojis(userInput).pop()

      if (!isEmoji(value)) {
        alert('This not a valid emoji character!')
        return
      }

      const newState = { defaultBlank: value }

      if (confirm('Replace existing blank emojis?')) {
        newState.matrix = structuredClone(this.canvasStore.getProperty('matrix'))
          .map(line => {
            return line.map(emoji => emoji === defaultBlank ? value : emoji)
          })
      }

      button.innerText = value

      this.canvasStore.setState(newState)
      this.canvasStore.write()
    })

    const label = document.createElement('label')
    label.classList.add('emoji-paint__toolbar-label')
    label.append('Blank', ' ', button)

    const container = document.createElement('div')
    container.title = 'Default blank emoji'
    container.classList.add('emoji-paint__toolbar-top-default-blank')
    container.append(label)

    this.appendItem('defaultBlank', container)
  }

  setupUndoRedo() {
    const btnUndo = this.elements.btnUndo = document.createElement('button')
    btnUndo.classList.add(
      'emoji-paint__toolbar-top-btn-undo',
      'emoji-paint__btn-icon',
      'radius--left'
    )
    btnUndo.title = 'Undo'
    btnUndo.innerText = '↩️'
    btnUndo.addEventListener('click', () => {
      this.undoRedoStore.undo()
    })

    const btnRedo = this.elements.btnRedo = document.createElement('button')
    btnRedo.classList.add(
      'emoji-paint__toolbar-top-btn-redo',
      'emoji-paint__btn-icon',
      'radius--right'
    )
    btnRedo.title = 'Redo'
    btnRedo.innerText = '↪️'
    btnRedo.addEventListener('click', () => {
      this.undoRedoStore.redo()
    })

    const container = document.createElement('div')
    container.classList.add('emoji-paint__toolbar-top-undo-redo')
    container.append(btnUndo, btnRedo)

    this.appendItem('undoRedo', container)
  }
}
