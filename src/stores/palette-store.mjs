import { DEFAULT_PALETTES } from '../constants/palettes.mjs'
import { PersistentStore } from '../classes/persistent-store.mjs'
import { DEFAULT_BLANK, STORE_STORAGE_KEY } from '../constants/globals.mjs'

export class PaletteStore extends PersistentStore {
  static initialState = {
    palettes: structuredClone(DEFAULT_PALETTES),
    selectedPaletteIndex: 0,
    // NOTE: 0 = mouse left, 1 = mouse middle, 2 = mouse right
    selectedEntries: { 0: null, 1: null, 2: null }
  }

  constructor() {
    super(PaletteStore.initialState, `${STORE_STORAGE_KEY}.palette`)
    this.state.selectedEntries[0] = this.getSelectedPalette().entries.at(0)
    this.state.selectedEntries[2] = DEFAULT_BLANK
  }

  getPalettes() {
    return this.state.palettes
  }

  replacePalette(newPalette) {
    const paletteIndex = this.state.palettes.find((palette => palette.name === newPalette.name))

    if (paletteIndex > 0) {
      throw new RangeError(`Palette '${newPalette.name}' not found!`)
    }

    const newPalettes = structuredClone(this.state.palettes)

    newPalettes.splice(paletteIndex, 1, newPalette)

    this.setState({ palettes: newPalettes })
  }

  resetPalette() {
    const selectedPalette = this.getSelectedPalette()
    const defaultPalette = PaletteStore.initialState.palettes.find(palette => palette.name === selectedPalette.name)
    this.replacePalette(defaultPalette)
  }

  getSelectedPalette() {
    return this.state.palettes[this.state.selectedPaletteIndex]
  }

  getSelectedPaletteIndex() {
    return this.state.selectedPaletteIndex
  }

  setSelectedPaletteIndex(newIndex) {
    if (newIndex < 0 || newIndex >= this.state.palettes) {
      throw new RangeError(`Palette with index "${newIndex}" doest not exist!`)
    }

    this.setState({ selectedPalette: newIndex })
  }

  getSelectedEntry(button = 0) {
    if (!(button in this.state.selectedEntries)) {
      throw new RangeError('Given button index not in range!')
    }

    return this.state.selectedEntries[button]
  }

  setSelectedEntry(button, entry) {
    if (!(button in this.state.selectedEntries)) {
      throw new RangeError('Given button index not in range!')
    }

    const newSelectedEntries = {
      ...this.state.selectedEntries,
      ...{ [button]: entry }
    }

    this.setState({ ...{ selectedEntries: newSelectedEntries } })
  }
}
