import { Store } from './store.mjs'

export class PersistentStore extends Store {
  storageKey = null
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
    const storageData = JSON.parse(localStorage.getItem(storageKey))

    if (!storageData || !storageData[stateKey]) {
      return
    }

    this.setState(storageData[stateKey], false)
  }

  write() {
    const [ storageKey, stateKey ] = this.storageKey.split('.')
    const newStoredState = {}
    const storageData = JSON.parse(localStorage.getItem(storageKey)) ?? {}

    for (const statePropertyKey of this.stateChanges) {
      newStoredState[statePropertyKey] = this.state[statePropertyKey]
    }

    storageData[stateKey] = newStoredState

    localStorage.setItem(storageKey, JSON.stringify(storageData))
  }
}
