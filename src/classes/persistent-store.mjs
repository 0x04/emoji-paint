import { Store } from './store.mjs'
import { Collection } from './collection.js'

export class PersistentStore extends Store {
  /**
   * @type {string}
   */
  storageKey = null
  /**
   * @type {Set<string>}
   */
  writeChange = new Set()

  constructor(initialState, storageKey) {
    super(initialState)
    this.storageKey = storageKey
  }

  setState(newState) {
    super.setState(newState)

    this.writeChange = new Set([
      ...this.writeChange,
      ...Object.keys(newState)
    ])
  }

  read() {
    const [ storageKey, stateKey ] = this.storageKey.split('.')
    const storage = JSON.parse(localStorage.getItem(storageKey))

    if (!storage || !storage[stateKey]) {
      return
    }

    this.setState(this.merge(storage[stateKey]))
  }

  write(newStoredState = structuredClone(this.state)) {
    const [ storageKey, stateKey ] = this.storageKey.split('.')
    const storageData = JSON.parse(localStorage.getItem(storageKey)) ?? {}

    if (Object.keys(newStoredState).length === 0 && !this.writeChange.size) {
      return
    }

    for (const statePropertyKey of this.writeChange) {
      newStoredState[statePropertyKey] = this.state[statePropertyKey]
    }

    storageData[stateKey] = newStoredState

    localStorage.setItem(storageKey, JSON.stringify(storageData))

    this.writeChange = new Set()
  }

  merge(storageState) {
    const mergedState = this.clone(this.state)

    for (const key in mergedState) {
      if (!(key in storageState)) {
        continue
      }

      switch (Object.getPrototypeOf(mergedState[key]).constructor) {
        case Object:
          mergedState[key] = { ...mergedState[key], ...storageState[key] }
          break

        case Collection:
          mergedState[key].merge(storageState[key])
          break

        default:
          mergedState[key] = storageState[key]
          break
      }
    }

    return mergedState
  }

  clone() {
    const clonedState = structuredClone(this.state)
    const initialState = this.constructor.initialState

    // Restore right data type after `structuredClone(…)`
    for (const key in clonedState) {
      if (key in initialState && initialState[key]) {
        const initialEntry = initialState[key]
        const initialEntryClass = Object.getPrototypeOf(initialEntry).constructor

        switch (initialEntryClass) {
          case Collection:
            clonedState[key] = new Collection(
              initialEntry.identifier,
              clonedState[key]
            )
            break
        }
      }
    }

    return clonedState
  }
}
