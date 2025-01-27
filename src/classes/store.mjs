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
   * @param {Object} [initialState] A object containing the initial properties of state
   */
  constructor(initialState = {}) {
    this.state = structuredClone(initialState)
    this.stateChange = []
    this.listeners = []
  }

  /**
   * Returns the state object.
   * @returns {Object}
   */
  getState() {
    return this.state
  }

  /**
   * Spreads new state into current one.
   * @param {Object} newState
   */
  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.stateChange = Object.keys(newState)
    this.emit()
  }

  /**
   * Gets state property by name.
   * @param {string} name
   * @returns {*}
   */
  getProperty(name) {
    return this.state[name]
  }

  /**
   * Sets state property by name.
   * @param {string} name
   * @param {*} value
   */
  setProperty(name, value) {
    this.setState({ [name]: value })
  }

  /**
   * Checks if state property has changed.
   * @param {...string} propertyNames
   * @returns {boolean}
   */
  hasChange(...propertyNames) {
    if (this.isSubscribePhase) {
      return true
    }

    return propertyNames.some(
      (propertyName) => this.stateChange.some(
        (changedName) => propertyName === changedName
      )
    )
  }

  /**
   * Adds a listener function.
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
   * Executes all listeners.
   */
  emit() {
    this.listeners.forEach(
      (listener) => listener(this)
    )
    this.stateChange = []
  }
}
