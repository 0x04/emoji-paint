import { DEFAULT_BLANK } from '../constants/globals.mjs'

export class PaletteSelection {
  palette = null
  elements = {
    container: null,
    selectionLeft: null,
    selectionRight: null
  }

  constructor(palette) {
    this.onPaletteStoreChange = this.onPaletteStoreChange.bind(this)

    const { store: paletteStore } = this.palette = palette
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

    paletteStore.subscribe(this.onPaletteStoreChange)
  }

  onPaletteStoreChange(state, store) {
    const { selectionLeft, selectionRight } = this.elements

    selectionLeft.textContent = store.getSelectedEntry(0)
    selectionRight.textContent = store.getSelectedEntry(2)
  }
}
