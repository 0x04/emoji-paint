import { Store } from './store.mjs'

export class PersistentStore extends Store {
  /**
   * @type {string}
   */
  storageKey = null
  /**
   * @type {Set<string>}
   */
  stateChanges = new Set()

  constructor(initialState, storageKey) {
    super(initialState)
    this.storageKey = storageKey
  }

  setState(newState, setChanges = true) {
    super.setState(newState)

    if (!setChanges) {
      return
    }

    this.stateChanges = new Set([
      ...this.stateChanges,
      ...Object.keys(newState)
    ])
  }

  read() {
    const [ storageKey, stateKey ] = this.storageKey.split('.')
    const storage = JSON.parse(localStorage.getItem(storageKey))

    if (!storage || !storage[stateKey]) {
      return
    }

    this.setState(this.merge(storage[stateKey]), false)
  }

  write(newStoredState = {}) {
    const [ storageKey, stateKey ] = this.storageKey.split('.')
    const storageData = JSON.parse(localStorage.getItem(storageKey)) ?? {}

    if (Object.keys(newStoredState).length === 0 && !this.stateChanges.size) {
      return
    }

    for (const statePropertyKey of this.stateChanges) {
      newStoredState[statePropertyKey] = this.state[statePropertyKey]
    }

    storageData[stateKey] = newStoredState

    localStorage.setItem(storageKey, JSON.stringify(storageData))

    this.stateChanges = new Set()
  }

  merge(storageState) {
    const mergedState = structuredClone(this.state)

    for (const key in mergedState) {
      if (!(key in storageState)) {
        continue
      }

      switch (Object.getPrototypeOf(mergedState[key]).constructor) {
        case Object:
          mergedState[key] = { ...mergedState[key], ...storageState[key] }
          break

        case Array:
          mergedState[key] = mergedState[key].map(
            (mergedItem) => storageState[key].find(storageState => mergedItem.name === storageState.name) || mergedItem
          )
          break

        default:
          mergedState[key] = storageState[key]
          break
      }
    }

    return mergedState
  }
}
