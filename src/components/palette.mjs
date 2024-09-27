import { PaletteSelection } from './palette-selection.mjs'
import { PaletteDropdown } from './palette-dropdown.mjs'
import { PaletteEditor } from './palette-editor.mjs'

export class Palette {
  static ITEM_CLASSNAME = 'emoji-paint__palette-item'

  elements = {
    container: null,
    items: null,
  }
  /**
   * @type {Paint}
   */
  paint = null
  /**
   * @type {PaletteStore}
   */
  store = null
  /**
   * @type {PaletteEditor}
   */
  editor = null
  /**
   * @type {PaletteDropdown}
   */
  dropdown = null
  /**
   * @type {PaletteSelection}
   */
  selection = null

  constructor(paint) {
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onDropdownChange = this.onDropdownChange.bind(this)
    this.onPaletteStoreChange = this.onPaletteStoreChange.bind(this)

    document.addEventListener('paletteDropdownChange', this.onDropdownChange)

    this.paint = paint

    const paletteStore = this.store = paint.stores.palette
    const container = this.elements.container = document.createElement('div')
    const items = this.elements.items = document.createElement('div')

    container.classList.add('emoji-paint__palette')

    items.classList.add('emoji-paint__palette-items')
    items.addEventListener('mousedown', this.onMouseDown)
    items.addEventListener('contextmenu', (event) => event.preventDefault())

    this.selection = new PaletteSelection(this)
    this.dropdown = new PaletteDropdown(this)
    this.editor = new PaletteEditor(this)

    container.append(
      this.selection.elements.container,
      this.dropdown.element,
      this.editor.elements.container,
      items
    )

    paletteStore.read()
    paletteStore.subscribe(this.onPaletteStoreChange)

    this.dropdown.setup(paletteStore.getSelectedPalette())
  }

  setup() {
    const { items } = this.elements

    while (items.childElementCount) {
      items.removeChild(items.lastChild)
    }

    const selectedPalette = this.store.getSelectedPalette()
    const itemsNew = selectedPalette.entries.map((entry, index) => {
      const item = document.createElement('input')

      item.classList.add(Palette.ITEM_CLASSNAME)
      item.type = 'radio'
      item.name = Palette.ITEM_CLASSNAME
      item.value = entry
      item.dataset.index = index.toString()

      return item
    })

    items.append(...itemsNew)
  }

  select(index = 0, mouseButton = 0) {
    const { items } = this.elements

    if (!(index in items.children)) {
      return
    }

    const item = items.children.item(index)

    item.checked = true

    this.store.setSelectedEntry(mouseButton, this.store.getSelectedPalette().entries.at(index))
  }

  onMouseDown(event) {
    this.select(
      parseInt(event.target.dataset.index),
      event.button
    )
  }

  onDropdownChange(event) {
    this.select(event.detail.index)
    this.setup()
  }

  onPaletteStoreChange() {
    this.setup()
  }
}
