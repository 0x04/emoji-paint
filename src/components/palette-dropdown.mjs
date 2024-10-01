export class PaletteDropdown {
  /**
   * @type {Palette}
   */
  palette = null
  /**
   * @type {HTMLSelectElement}
   */
  element = null

  constructor(palette) {
    this.onChange = this.onChange.bind(this)

    this.palette = palette

    this.element = document.createElement('select')
    this.element.classList.add('emoji-paint__palette_dropdown')
    this.element.addEventListener('change', this.onChange)
  }

  setup() {
    const { store: paletteStore } = this.palette

    while (this.element.childElementCount) {
      this.element.removeChild(this.element.firstChild)
    }

    const options = paletteStore.getPalettes().map((palette) => {
      const option = document.createElement('option')

      option.text = option.value = palette.name

      return option
    })

    this.element.append(...options)
  }

  onChange() {
    const { store: paletteStore } = this.palette

    paletteStore.setSelectedPaletteIndex(this.element.selectedIndex)
  }
}
