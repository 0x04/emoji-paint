export class Store {
  /**
   * @type {Object}
   */
  state = null
  /**
   * @type {Array}
   */
  listeners = null

  constructor(initialState = {}) {
    this.state = structuredClone(initialState)
    this.listeners = []
  }

  getState() {
    return this.state
  }

  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.emit()
  }

  subscribe(listener) {
    this.listeners.push(listener)
    listener(this.getState(), this)
  }

  emit() {
    this.listeners.forEach(
      (listener) => listener(this.state, this)
    )
  }
}
