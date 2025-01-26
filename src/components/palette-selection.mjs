import { DEFAULT_BLANK } from '../constants/globals.mjs'

export class PaletteSelection {
  elements = {
    container: null,
    selectionLeft: null,
    selectionMiddle: null,
    selectionRight: null
  }
  /**
   * @type {Palette}
   */
  palette = null

  constructor(palette) {
    this.onPaletteStoreChange = this.onPaletteStoreChange.bind(this)

    const { store: paletteStore } = this.palette = palette
    const container = this.elements.container = document.createElement('div')
    const selectionLeft = this.elements.selectionLeft = document.createElement('div')
    const selectionMiddle = this.elements.selectionMiddle = document.createElement('div')
    const selectionRight = this.elements.selectionRight = document.createElement('div')
    const className = 'emoji-paint__palette-selection-item'

    container.classList.add('emoji-paint__palette-selection')

    selectionLeft.classList.add(className, `${className}--left`)
    selectionLeft.textContent = DEFAULT_BLANK
    selectionLeft.title = 'Left mouse button'

    selectionMiddle.classList.add(className, `${className}--middle`)
    selectionMiddle.textContent = DEFAULT_BLANK
    selectionMiddle.title = 'Middle mouse button'

    selectionRight.classList.add(className, `${className}--right`)
    selectionRight.textContent = DEFAULT_BLANK
    selectionRight.title = 'Right mouse button'

    container.append(selectionLeft, selectionMiddle, selectionRight)

    paletteStore.subscribe(this.onPaletteStoreChange)
  }

  onPaletteStoreChange(store) {
    if (!store.hasChange('selectedEntries')) {
      return
    }

    const { selectionLeft, selectionMiddle, selectionRight } = this.elements

    selectionLeft.textContent = store.getSelectedEntry(0)
    selectionMiddle.textContent = store.getSelectedEntry(1)
    selectionRight.textContent = store.getSelectedEntry(2)
  }
}
