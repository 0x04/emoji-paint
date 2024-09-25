import { DEFAULT_PALETTES } from '../constants/palettes.mjs'

export class PaletteDropdown {
  element = null

  constructor() {
    this.onChange = this.onChange.bind(this)

    this.element = document.createElement('select')
    this.element.classList.add('emoji-paint__palette_dropdown')
    this.element.addEventListener('change', this.onChange)
  }

  setup(palettes = DEFAULT_PALETTES) {
    while (this.element.childElementCount) {
      this.element.removeChild(this.element.firstChild)
    }

    const options = palettes.map((palette) => {
      const option = document.createElement('option')

      option.text = option.value = palette.name

      return option
    })

    this.element.append(...options)
  }

  dispatchChange() {
    const option = this.element.selectedOptions.item(0)
    const detail = { paletteName: option.value }
    const event = new CustomEvent('paletteDropdownChange', {
      bubbles: true,
      cancelable: false,
      detail
    })

    this.element.dispatchEvent(event)
  }

  onChange() {
    this.dispatchChange()
  }
}
