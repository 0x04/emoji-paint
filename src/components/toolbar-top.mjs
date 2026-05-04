import { Toolbar } from './toolbar.mjs'
import { copyToClipboard } from '../functions/copy-to-clipboard.mjs'
import { isEmoji } from '../functions/is-emoji.mjs'
import { matchEmojis } from '../functions/match-emojis.mjs'
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../constants/globals.mjs'

export class ToolbarTop extends Toolbar {
  elements = {
    resizeInputWidth: null,
    resizeInputHeight: null
  }
  /**
   * @type {CanvasStore}
   */
  canvasStore = null

  constructor(canvasStore) {
    super('emoji-paint__toolbar-top')
    this.onCanvasStoreChange = this.onCanvasStoreChange.bind(this)

    this.canvasStore = canvasStore
    this.setup()
    this.canvasStore.subscribe(this.onCanvasStoreChange)
  }

  onCanvasStoreChange(store) {
    if (store.hasChange('width', 'height')) {
      this.elements.resizeInputWidth.value = store.getProperty('width')
      this.elements.resizeInputHeight.value = store.getProperty('height')
    }
  }

  setup() {
    this.setupBtnCopy()
    this.appendSeparator()
    this.setupBtnDownload()
    this.setupBtnUpload()
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
    const label = document.createElement('span')
    label.classList.add('emoji-paint__toolbar-label')
    label.innerText = 'Size'

    const inputWidth = this.elements.resizeInputWidth = document.createElement('input')
    inputWidth.classList.add('radius--left')
    inputWidth.type = 'number'
    inputWidth.value = String(DEFAULT_WIDTH)

    const inputHeight = this.elements.resizeInputHeight = document.createElement('input')
    inputHeight.classList.add('radius--middle')
    inputHeight.value = String(DEFAULT_HEIGHT)
    inputHeight.type = 'number'

    const btnResize = document.createElement('button')
    btnResize.classList.add(
      'emoji-paint__toolbar-top-btn-resize',
      'emoji-paint__btn-icon',
      'radius--right'
    )
    btnResize.title = 'Resize Canvas'
    btnResize.innerText = '📐'
    btnResize.addEventListener('click', () => {
      this.canvasStore.setDimensions(
        parseInt(inputWidth.value),
        parseInt(inputHeight.value)
      )
      this.canvasStore.write()
    })

    const containerResize = document.createElement('div')
    containerResize.classList.add('emoji-paint__toolbar-top-resize')
    containerResize.append(label, inputWidth, inputHeight, btnResize)

    this.appendItem('resize', containerResize)
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

  setupBtnDownload() {
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

    this.appendItem('btnDownload', btnDownload)
  }

  setupBtnUpload() {
    const labelUpload = document.createElement('label')
    const btnUpload = document.createElement('input')

    btnUpload.classList.add('emoji-paint__toolbar-top-btn-upload')
    btnUpload.type = 'file'
    btnUpload.title = 'Upload'
    btnUpload.addEventListener('change', () => {
      const [ file ] = btnUpload.files
      const fileReader = new FileReader()

      fileReader.addEventListener('load', () => {
        this.canvasStore.setString(fileReader.result)
        this.canvasStore.write()
      })
      fileReader.readAsText(file)
    })

    labelUpload.classList.add(
      'emoji-paint__toolbar-top-label-upload',
      'emoji-paint__btn-icon',
      'radius--right'
    )
    labelUpload.title = 'Upload'
    labelUpload.append('⬆️', btnUpload)

    this.appendItem('btnUpload', labelUpload)
  }

  setupBackgroundColor() {
    const container = document.createElement('div')
    const label = document.createElement('label')
    const input = document.createElement('input')

    container.title = 'Background color'
    container.classList.add('emoji-paint__toolbar-top-background-color')

    label.classList.add('emoji-paint__toolbar-label')

    input.type = 'color'
    input.value = this.canvasStore.getProperty('backgroundColor')
    input.addEventListener('change', () => {
      this.canvasStore.setProperty('backgroundColor', input.value)
      this.canvasStore.write()
    })

    label.append('Background', ' ', input)

    container.append(label)

    this.appendItem('background', container)
  }

  setupDefaultBlank() {
    const defaultBlank = this.canvasStore.getProperty('defaultBlank')
    const container = document.createElement('div')
    const label = document.createElement('label')
    const button = document.createElement('button')

    container.title = 'Default blank emoji'
    container.classList.add('emoji-paint__toolbar-top-default-blank')

    label.classList.add('emoji-paint__toolbar-label')

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

    label.append('Blank', ' ', button)
    container.append(label)

    this.appendItem('btnDefaultBlank', container)
  }
}
