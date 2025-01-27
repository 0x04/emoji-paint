import { DEFAULT_PALETTES } from '../constants/palettes.mjs'
import { PersistentStore } from '../classes/persistent-store.mjs'
import { DEFAULT_BLANK, STORE_STORAGE_KEY } from '../constants/globals.mjs'
import { Collection } from '../classes/collection.js'

export class PaletteStore extends PersistentStore {
  /**
   * @type {{palettes: Collection, selectedPaletteIndex: number, selectedEntries: {0: string, 1: string, 2: string}}}
   */
  static initialState = {
    palettes: new Collection('name', DEFAULT_PALETTES),
    selectedPaletteIndex: 0,
    // NOTE: 0 = mouse left, 1 = mouse middle, 2 = mouse right
    selectedEntries: { 0: DEFAULT_BLANK, 1: DEFAULT_BLANK, 2: DEFAULT_BLANK }
  }

  /**
   * @type {Set<number>}
   */
  paletteChanges = new Set()

  constructor() {
    super(PaletteStore.initialState, `${STORE_STORAGE_KEY}.palette`)
    this.state.selectedEntries[0] = this.getSelectedPalette().entries.at(0)
  }

  /** @inheritDoc */
  write() {
    // Filter all default, unchanged palettes out
    const newPalettes = this.state.palettes
      .filter((palette) => PaletteStore.initialState.palettes.findIndex(
        (defaultPalette) => defaultPalette.entries.length === palette.entries.length
          && defaultPalette.entries.every((entry, index) => entry === palette.entries[index])) < 0
      )

    this.writeChange.delete('palettes')

    super.write({ ...this.state, palettes: newPalettes })
  }

  /**
   * Returns the current palettes collection.
   * @returns {Collection[{name: string, entries: string[]}]}
   */
  getPalettes() {
    return this.state.palettes
  }

  /**
   * Replace a palette with a new one, identified by `newPalette.name`.
   * @param {{name: string, entries: string[]}} newPalette
   */
  replacePalette(newPalette) {
    const paletteIndex = this.state.palettes.findLastIndex((palette) => palette.name === newPalette.name)

    if (paletteIndex < 0) {
      throw new RangeError(`Palette '${newPalette.name}' not found!`)
    }

    const newPalettes = structuredClone(this.state.palettes)

    newPalettes.splice(paletteIndex, 1, newPalette)

    this.paletteChanges.add(paletteIndex)
    this.setState({ palettes: newPalettes })
  }

  /**
   * Resets the current selected palette with the initial palette.
   */
  resetPalette() {
    const selectedPalette = this.getSelectedPalette()
    const defaultPalette = PaletteStore.initialState.palettes.find(palette => palette.name === selectedPalette.name)
    this.replacePalette(defaultPalette)
  }

  /**
   * Return the current selected palette.
   * @returns {{name: string, entries: string[]}}
   */
  getSelectedPalette() {
    return this.state.palettes[this.state.selectedPaletteIndex]
  }

  /**
   * Returns the index of the current selected palette.
   * @returns {number}
   */
  getSelectedPaletteIndex() {
    return this.state.selectedPaletteIndex
  }

  /**
   * Sets the index of the current selected palette.
   * @param {number} newIndex
   */
  setSelectedPaletteIndex(newIndex) {
    if (newIndex < 0 || newIndex >= this.state.palettes) {
      throw new RangeError(`Palette with index "${newIndex}" doest not exist!`)
    }

    this.setState({ selectedPaletteIndex: newIndex })
  }

  /**
   * Return the content of the current selected palette entry.
   * @param {number} button
   * @returns {string}
   */
  getSelectedEntry(button = 0) {
    if (!(button in this.state.selectedEntries)) {
      throw new RangeError('Given button index not in range!')
    }

    return this.state.selectedEntries[button]
  }

  /**
   * Sets the content of selected palette entry of the given button.
   * @param {number} button
   * @param {string} entry
   */
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
