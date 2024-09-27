import { splitEmoji } from '../functions/split-emojis.mjs'
import { DEFAULT_PALETTES } from '../constants/palettes.mjs'
import { isEmoji } from '../functions/is-emoji.mjs'

export class PaletteEditor {
  elements = {
    container: null,
    btnEdit: null,
    btnReset: null,
    inputEdit: null
  }
  palette = null
  valueCurrent = null

  constructor(palette) {
    this.onBtnEditClick = this.onBtnEditClick.bind(this)
    this.onBtnResetClick = this.onBtnResetClick.bind(this)
    this.onInputEditBlur = this.onInputEditBlur.bind(this)
    this.onInputEditKeyPress = this.onInputEditKeyPress.bind(this)
    this.onPaletteStoreChange = this.onPaletteStoreChange.bind(this)

    const { store: paletteStore } = this.palette = palette
    const container = this.elements.container = document.createElement('div')
    const btnEdit = this.elements.btnEdit = document.createElement('button')
    const btnReset = this.elements.btnReset = document.createElement('button')
    const inputEdit = this.elements.inputEdit = document.createElement('textarea')

    container.classList.add('emoji-paint__palette-editor')

    btnEdit.classList.add(
      'emoji-paint__palette-editor-btn-edit',
      'emoji-paint__btn-icon',
      'radius--left'
    )
    btnEdit.title = 'Edit palette'
    btnEdit.textContent = '✏️'
    btnEdit.addEventListener('click', this.onBtnEditClick)

    btnReset.classList.add(
      'emoji-paint__palette-editor-btn-reset',
      'emoji-paint__btn-icon',
      'radius--right'
    )
    btnReset.title = 'Reset palette'
    btnReset.textContent = '🧹'
    btnReset.addEventListener('click', this.onBtnResetClick)

    inputEdit.classList.add('emoji-paint__palette-editor-input-edit')
    inputEdit.addEventListener('blur', this.onInputEditBlur)
    inputEdit.addEventListener('keypress', this.onInputEditKeyPress)

    container.append(btnEdit, btnReset)

    paletteStore.subscribe(this.onPaletteStoreChange)
  }

  enable() {
    const { items } = this.palette.elements
    const { inputEdit } = this.elements

    inputEdit.value = this.valueCurrent
    inputEdit.style.setProperty('height', `${items.offsetHeight}px`)

    items.replaceWith(inputEdit)

    inputEdit.focus()
  }

  disable() {
    const { items } = this.palette.elements
    const { inputEdit } = this.elements

    inputEdit.replaceWith(items)

    this.dispatchChange()
  }

  dispatchChange(value = this.elements.inputEdit.value) {
    const { store: paletteStore } = this.palette
    const newPalette = {
      name: paletteStore.getSelectedPalette().name,
      entries: [ ...new Set(splitEmoji(value)) ]
    }

    paletteStore.replacePalette(newPalette)
  }

  onBtnEditClick() {
    this.enable()
  }

  onBtnResetClick() {
    const { store: paletteStore } = this.palette

    paletteStore.resetPalette()
  }

  onInputEditKeyPress(event) {
    switch (event.code) {
      default:
        const value = String.fromCharCode(event.charCode)

        if (!isEmoji(value)) {
          event.preventDefault()
          alert('This not a valid emoji character!')
        }
        break

      case 'Enter':
        event.target.blur()
        break
    }
  }

  onInputEditBlur() {
    this.disable()
  }

  onPaletteStoreChange() {
    const { store: paletteStore } = this.palette
    const currentPalette = paletteStore.getSelectedPalette()
    const paletteDefault = DEFAULT_PALETTES.find((palette) => palette.name === currentPalette.name)

    this.elements.btnReset.disabled = (!paletteDefault)
      || (
        currentPalette.entries.length === paletteDefault.entries.length
        && currentPalette.entries.every((entry, index) => entry === paletteDefault.entries.at(index))
      )

    this.valueCurrent = currentPalette.entries.join('')
  }
}
