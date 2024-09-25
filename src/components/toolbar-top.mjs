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
    this.attachSpacer()
    this.setupNew()
    this.attachSeparator()
    this.setupBtnClear()
  }

  setupNew() {
    const containerNew = document.createElement('div')
    const label = document.createElement('span')
    const inputWidth = document.createElement('input')
    const inputHeight = document.createElement('input')
    const btnNew = document.createElement('button')

    containerNew.classList.add('emoji-paint__toolbar-top-new')

    label.classList.add('emoji-paint__toolbar-label')
    label.innerText = 'Size'

    inputWidth.type = inputHeight.type = 'number'
    inputWidth.value = this.paint.width
    inputHeight.value = this.paint.height

    btnNew.classList.add(
      'emoji-paint__toolbar-top-btn-new',
      'emoji-paint__icon-btn'
    )
    btnNew.title = 'New Canvas'
    btnNew.innerText = '💥️'
    btnNew.addEventListener('click', () => {
        this.paint.canvas.setup(
          parseInt(inputWidth.value),
          parseInt(inputHeight.value)
        )
      }
    )

    containerNew.append(label, inputWidth, inputHeight, btnNew)

    this.attachItem('new', containerNew)
  }

  setupBtnClear() {
    const btnClear = document.createElement('button')

    btnClear.classList.add(
      'emoji-paint__toolbar-top-btn-clear',
      'emoji-paint__icon-btn'
    )
    btnClear.title = 'Clear Canvas'
    btnClear.innerText = '❌'
    btnClear.addEventListener('click', () => {
      this.paint.canvas.clear()
    })

    this.attachItem('btnCopy', btnClear)
  }

  setupBtnCopy() {
    const btnCopy = document.createElement('button')

    btnCopy.classList.add(
      'emoji-paint__toolbar-top-btn-copy',
      'emoji-paint__icon-btn'
    )
    btnCopy.title = 'Copy to Clipboard'
    btnCopy.innerText = '📋'
    btnCopy.addEventListener('click', () => {
      copyToClipboard(this.paint.canvas.data.toString())
    })

    this.attachItem('btnCopy', btnCopy)
  }
}
