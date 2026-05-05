import { Store } from '../classes/store.mjs'

export class UndoRedoStore extends Store {
  static MAX_STACK_SIZE = 20

  static initialState = {
    stack: [],
    currentIndex: -1
  }

  canvasStore = null
  currentIndex = -1
  isProcessingPhase = false

  constructor(canvasStore) {
    super(UndoRedoStore.initialState)

    this.onCanvasStoreChange = this.onCanvasStoreChange.bind(this)

    this.canvasStore = canvasStore
    this.canvasStore.subscribe(this.onCanvasStoreChange)
  }

  get canUndo() {
    return (
      this.state.stack.length > 1
      && this.state.currentIndex > 0
      && this.state.currentIndex < this.state.stack.length
    )
  }

  get canRedo() {
    return (
      this.state.stack.length > 0
      && this.state.currentIndex < this.state.stack.length - 1
    )
  }

  undo() {
    if (!this.canUndo) {
      return
    }

    this.isProcessingPhase = true

    const newIndex = this.state.currentIndex - 1
    const undoState = this.state.stack.at(newIndex)
    this.canvasStore.setState(undoState)
    this.canvasStore.write()
    this.setProperty('currentIndex', newIndex)

    this.isProcessingPhase = false
  }

  redo() {
    if (!this.canRedo) {
      return
    }

    this.isProcessingPhase = true

    const newIndex = this.state.currentIndex + 1
    const redoState = this.state.stack.at(newIndex)
    this.canvasStore.setState(redoState)
    this.canvasStore.write()
    this.setProperty('currentIndex', newIndex)

    this.isProcessingPhase = false
  }

  /**
   * @param {{width: number, height: number, matrix: array[], defaultBlank: string, backgroundColor: string}} stateObject
   */
  save(stateObject) {
    const newStack = this.state.stack
      .slice(0, this.state.currentIndex + 1)
      .concat(structuredClone(stateObject))
      .slice(-(UndoRedoStore.MAX_STACK_SIZE + 1))

    this.setState({ stack: newStack, currentIndex: newStack.length - 1 })
  }

  onCanvasStoreChange(store) {
    if (!this.isProcessingPhase) {
      this.save(store.getState())
    }
  }
}
