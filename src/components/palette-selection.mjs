import { DEFAULT_BLANK } from '../constants/palettes.mjs'

export class PaletteSelection {
  value = { left: DEFAULT_BLANK, right: DEFAULT_BLANK }
  elements = {
    container: null,
    selectionLeft: null,
    selectionRight: null
  }

  constructor() {
    this.onPaletteSelectionChange = this.onPaletteSelectionChange.bind(this)

    const container = this.elements.container = document.createElement('div')
    const selectionLeft = this.elements.selectionLeft = document.createElement('div')
    const selectionRight = this.elements.selectionRight = document.createElement('div')

    container.classList.add('emoji-paint__palette-selection')

    selectionLeft.classList.add('emoji-paint__palette-selection-left')
    selectionLeft.textContent = DEFAULT_BLANK
    selectionLeft.title = 'Left mouse button'

    selectionRight.classList.add('emoji-paint__palette-selection-right')
    selectionRight.textContent = DEFAULT_BLANK
    selectionRight.title = 'Right mouse button'

    container.append(selectionLeft, selectionRight)

    document.addEventListener(
      'paletteSelectionChange',
      this.onPaletteSelectionChange
    )
  }

  onPaletteSelectionChange(event) {
    const { selectionLeft, selectionRight } = this.elements
    const { selected, mouseButton } = event.detail

    switch (mouseButton) {
      default:
        this.value.left = selected
        selectionLeft.textContent = selected
        break

      case 2:
        this.value.right = selected
        selectionRight.textContent = selected
        break
    }
  }
}
