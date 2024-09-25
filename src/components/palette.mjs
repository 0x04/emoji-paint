import { DEFAULT_PALETTES } from '../constants/palettes.mjs'
import { PaletteSelection } from './palette-selection.mjs'
import { PaletteDropdown } from './palette-dropdown.mjs'
import { PaletteEditor } from './palette-editor.mjs'

export class Palette {
  static ITEM_ID = 'emoji-paint__palette-item'
  elements = {
    container: null,
    items: null,
  }
  editor = null
  dropdown = null
  paletteCurrent = null
  palettes = null
  selection = null
  storage = null

  constructor(storage = null) {
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onDropdownChange = this.onDropdownChange.bind(this)
    this.onEditorChange = this.onEditorChange.bind(this)

    document.addEventListener('paletteDropdownChange', this.onDropdownChange)
    document.addEventListener('paletteEditorChange', this.onEditorChange)

    this.storage = storage
    this.palettes = structuredClone(DEFAULT_PALETTES)

    let palettesStored = this.storage.getItem(Palette.STORAGE_KEY) ?? []

    // FIXME: Rewrite old palette structure before ed81e83c0f487524d642cabb97d27bbce0621103
    if (palettesStored.constructor === Object) {
      const oldFormatPalettes = palettesStored

      palettesStored = []

      for (const [ name, value ] of Object.entries(oldFormatPalettes)) {
        palettesStored.push({ name, entries: [ ...value ] })
      }

      this.storage.setItem(Palette.STORAGE_KEY, palettesStored)
      this.storage.write()
    }

    palettesStored.forEach((palette) => {
      const index = this.palettes.findIndex((paletteDefault) => paletteDefault.name === palette.name)

      if (index < 0) {
        this.palettes.push(palette)
        return
      }

      this.palettes[index] = palette
    })

    this.paletteCurrent = this.palettes.at(0)

    const container = this.elements.container = document.createElement('div')
    const items = this.elements.items = document.createElement('div')

    container.classList.add('emoji-paint__palette')

    items.classList.add('emoji-paint__palette-items')
    items.addEventListener('mousedown', this.onMouseDown)
    items.addEventListener('contextmenu', (event) => event.preventDefault())

    this.selection = new PaletteSelection(this)
    this.dropdown = new PaletteDropdown()
    this.editor = new PaletteEditor(this)

    container.append(
      this.selection.elements.container,
      this.dropdown.element,
      this.editor.elements.container,
      items
    )

    this.dropdown.setup(this.palettes)
  }

  static get STORAGE_KEY() {
    return 'palettes'
  }

  setup() {
    const { items } = this.elements

    while (items.childElementCount) {
      items.removeChild(items.lastChild)
    }

    const itemsNew = this.paletteCurrent.entries.map((entry, index) => {
      const item = document.createElement('input')

      item.classList.add(Palette.ITEM_ID)
      item.type = 'radio'
      item.name = Palette.ITEM_ID
      item.value = entry
      item.dataset.index = index.toString()

      return item
    })

    items.append(...itemsNew)

    const event = new CustomEvent(
      'paletteChange', {
        bubbles: true,
        cancelable: false,
        detail: { palette: this.paletteCurrent }
      }
    )
    this.elements.container.dispatchEvent(event)

    this.select()
  }

  select(index = 0, mouseButton = 0) {
    const { items } = this.elements

    if (!(index in items.children)) {
      return
    }

    const selected = this.paletteCurrent.entries[index]
    const item = items.children.item(index)

    item.checked = true

    const detail = { index, mouseButton, selected }
    const eventChange = new CustomEvent('paletteSelectionChange', {
      bubbles: true,
      cancelable: false,
      detail
    })
    this.elements.container.dispatchEvent(eventChange)
  }

  onMouseDown(event) {
    this.select(
      parseInt(event.target.dataset.index),
      event.button
    )
  }

  onDropdownChange(event) {
    this.paletteCurrent = this.palettes.find((palette) => palette.name === event.detail.paletteName)
    this.setup()
  }

  onEditorChange(event) {
    const paletteCurrent = this.paletteCurrent = event.detail.palette
    const paletteDefault = DEFAULT_PALETTES.find((palette) => palette.name === paletteCurrent.name)
    let palettesStored = this.storage.getItem(Palette.STORAGE_KEY) ?? []

    // Replace previous palette item with changed one
    this.palettes = this.palettes.map(
      (palette) => (palette.name === paletteCurrent.name)
        ? paletteCurrent
        : palette
    )

    const isDefault = (
      paletteCurrent.entries.length === paletteDefault.entries.length
      && paletteCurrent.entries.every((entry, index) => entry === paletteDefault.entries.at(index))
    )

    if (isDefault) {
      // TODO: Implement delete or so in storage
      palettesStored = palettesStored.filter((palette) => palette.name !== paletteCurrent.name)
    } else {
      // TODO: Simplify merge
      const indexStored = palettesStored.findIndex((paletteStored) => paletteStored.name === paletteCurrent.name)

      if (indexStored > -1) {
        palettesStored.splice(indexStored, 1, paletteCurrent)
      } else {
        palettesStored.push(paletteCurrent)
      }
    }

    this.storage.setItem(
      Palette.STORAGE_KEY,
      palettesStored
    )

    this.storage.write()
    this.setup()
  }
}
