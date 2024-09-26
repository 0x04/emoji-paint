import { Toolbar } from './toolbar.mjs'
import { copyToClipboard } from '../functions/copy-to-clipboard.mjs'

export class ToolbarTop extends Toolbar {
  constructor(paint) {
    super('emoji-paint__toolbar-top')
    this.paint = paint
    this.setup()
  }

  setup() {
    this.setupBtnCopy()
    this.attachSeparator()
    this.setupBtnDownload()
    this.setupBtnUpload()
    this.attachSpacer()
    this.setupResize()
    this.attachSeparator()
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
    inputWidth.value = this.paint.width
    inputHeight.classList.add('radius--middle')
    inputHeight.value = this.paint.height

    btnResize.classList.add(
      'emoji-paint__toolbar-top-btn-resize',
      'emoji-paint__btn-icon',
      'radius--right'
    )
    btnResize.title = 'Resize Canvas'
    btnResize.innerText = '📐'
    btnResize.addEventListener('click', () => {
        this.paint.canvas.setup(
          parseInt(inputWidth.value),
          parseInt(inputHeight.value)
        )
      }
    )

    containerResize.append(label, inputWidth, inputHeight, btnResize)

    this.attachItem('resize', containerResize)
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
      this.paint.canvas.clear()
    })

    this.attachItem('btnCopy', btnClear)
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
      copyToClipboard(this.paint.canvas.data.toString())
    })

    this.attachItem('btnCopy', btnCopy)
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
      const anchor = document.createElement('a')
      const data = this.paint.canvas.data.toString()
      const blob = new Blob([ data ], { type: 'text/plain' })

      anchor.download = 'emoji-paint.txt'
      anchor.href = URL.createObjectURL(blob)

      document.body.append(anchor)

      anchor.click()
      anchor.remove()
    })

    this.attachItem('btnDownload', btnDownload)
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
        const { data } = this.paint.canvas
        const { canvas } = this.paint

        data.setFromString(fileReader.result)
        canvas.setup(data.width, data.height)
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

    this.attachItem('btnUpload', labelUpload)
  }
}
