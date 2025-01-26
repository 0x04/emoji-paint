import { Toolbar } from './toolbar.mjs'
import { copyToClipboard } from '../functions/copy-to-clipboard.mjs'
import { isEmoji } from '../functions/is-emoji.mjs'
import { matchEmojis } from '../functions/match-emojis.mjs'

export class ToolbarTop extends Toolbar {
  elements = {
    resizeInputWidth: null,
    resizeInputHeight: null
  }
  /**
   * @type {Paint}
   */
  paint = null

  constructor(paint) {
    super('emoji-paint__toolbar-top')
    this.onCanvasStoreChange = this.onCanvasStoreChange.bind(this)

    this.paint = paint
    this.setup()

    const { canvas: canvasStore } = this.paint.stores

    canvasStore.subscribe(this.onCanvasStoreChange)
  }

  onCanvasStoreChange(state) {
    this.elements.resizeInputWidth.value = state.width
    this.elements.resizeInputHeight.value = state.height
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
    const containerResize = document.createElement('div')
    const label = document.createElement('span')
    const inputWidth = document.createElement('input')
    const inputHeight = document.createElement('input')
    const btnResize = document.createElement('button')

    containerResize.classList.add('emoji-paint__toolbar-top-resize')

    label.classList.add('emoji-paint__toolbar-label')
    label.innerText = 'Size'

    inputWidth.classList.add('radius--left')
    inputWidth.type = inputHeight.type = 'number'
    inputWidth.value = this.paint.width.toString(10)
    inputHeight.classList.add('radius--middle')
    inputHeight.value = this.paint.height.toString(10)

    btnResize.classList.add(
      'emoji-paint__toolbar-top-btn-resize',
      'emoji-paint__btn-icon',
      'radius--right'
    )
    btnResize.title = 'Resize Canvas'
    btnResize.innerText = '📐'
    btnResize.addEventListener('click', () => {
      const { canvas: canvasStore } = this.paint.stores

      canvasStore.setDimensions(
        parseInt(inputWidth.value),
        parseInt(inputHeight.value)
      )
      canvasStore.write()
    })

    containerResize.append(label, inputWidth, inputHeight, btnResize)

    this.appendItem('resize', containerResize)

    this.elements.resizeInputWidth = inputWidth
    this.elements.resizeInputHeight = inputHeight
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
      const { canvas: canvasStore } = this.paint.stores

      canvasStore.clear()
      canvasStore.write()
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
      const { canvas: canvasStore } = this.paint.stores

      copyToClipboard(canvasStore.getString())
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
      const { canvas: canvasStore } = this.paint.stores
      const blob = new Blob([ canvasStore.getString() ], { type: 'text/plain' })
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
        const { canvas: canvasStore } = this.paint.stores

        canvasStore.setString(fileReader.result)
        canvasStore.write()
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
    const { canvas: canvasStore } = this.paint.stores
    const container = document.createElement('div')
    const label = document.createElement('label')
    const input = document.createElement('input')

    container.title = 'Background color'
    container.classList.add('emoji-paint__toolbar-top-background-color')

    label.classList.add('emoji-paint__toolbar-label')

    input.type = 'color'
    input.value = canvasStore.state.backgroundColor
    input.addEventListener('change', () => {
      canvasStore.setState({ backgroundColor: input.value })
      canvasStore.write()
    })

    label.append('Background', ' ', input)

    container.append(label)

    this.appendItem('background', container)
  }

  setupDefaultBlank() {
    const { canvas: canvasStore } = this.paint.stores
    const container = document.createElement('div')
    const label = document.createElement('label')
    const button = document.createElement('button')

    container.title = 'Default blank emoji'
    container.classList.add('emoji-paint__toolbar-top-default-blank')

    label.classList.add('emoji-paint__toolbar-label')

    button.innerText = canvasStore.state.defaultBlank
    button.addEventListener('click', () => {
      // NOTE: For the moment a very basic solution. The first idea of using a
      // text input didn't work because of the internal handling of the
      // `input` event while entering emojis in windows.
      const userInput = prompt('Enter a emoji character', canvasStore.state.defaultBlank)

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
        newState.matrix = structuredClone(canvasStore.state.matrix)
          .map(line => {
            return line.map(emoji => emoji === canvasStore.state.defaultBlank ? value : emoji)
          })
      }

      button.innerText = value

      canvasStore.setState(newState)
      canvasStore.write()
    })

    label.append('Blank', ' ', button)
    container.append(label)

    this.appendItem('btnDefaultBlank', container)
  }
}
