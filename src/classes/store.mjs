export class Store {
  /**
   * @type {Object}
   */
  state = null

  /**
   * @type {Array}
   */
  stateChange = null

  /**
   * @type {Array}
   */
  listeners = null

  /**
   * @type {boolean}
   */
  isSubscribePhase = false

  /**
   * @param {Object} initialState
   */
  constructor(initialState = {}) {
    this.state = structuredClone(initialState)
    this.stateChange = []
    this.listeners = []
  }

  /**
   * Returns the state object
   * @returns {Object}
   */
  getState() {
    return this.state
  }

  /**
   * Spreads new state into current one
   * @param {Object} newState
   */
  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.stateChange = Object.keys(newState)
    this.emit()
  }

  /**
   * Gets state property by name
   * @param {string} name
   * @returns {*}
   */
  getProperty(name) {
    return this.state[name]
  }

  /**
   * Sets state property by name
   * @param {string} name
   * @param {*} value
   */
  setProperty(name, value) {
    this.setState({ [name]: value })
  }

  /**
   * Checks if state property has changed
   * @param propertyName
   * @returns {boolean}
   */
  hasChange(propertyName) {
    return (this.isSubscribePhase || this.stateChange.some(changedName => changedName === propertyName))
  }

  /**
   * Adds a listener function
   * @param {Function} listener
   */
  subscribe(listener) {
    this.listeners.push(listener)
    // FIXME: I don't like this…
    this.isSubscribePhase = true
    listener(this)
    this.isSubscribePhase = false
  }

  /**
   * Execute all listeners
   */
  emit() {
    this.listeners.forEach(
      (listener) => listener(this)
    )
    this.stateChange = []
  }
}
