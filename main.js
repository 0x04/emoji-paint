import './style.css'

const DEFAULT_BLANK = '⬜'
const DEFAULT_PALETTES = [
  {
    name: 'Squares',
    entries: [ '⬛', '⬜', '🟥', '🟦', '🟧', '🟨', '🟩', '🟪', '🟫' ]
  },
  {
    name: 'Circles',
    entries: [ '⚫', '⚪', '🔴', '🔵', '🟠', '🟡', '🟢', '🟣', '🟤' ],
  },
  {
    name: 'Symbols',
    entries: [ '⏹️', '✳️', '✴️', '❇️', '❎', '🅿️', '🆙' ]
  },
  {
    name: 'Custom',
    entries: [ '👤' ]
  }
]
const DRAW_FUNCTIONS = {
  // DDA Line Algorithm
  lineSimple(pointA, pointB) {
    const dx = pointB.x - pointA.x
    const dy = pointB.y - pointA.y
    const steps = Math.max(Math.abs(dx), Math.abs(dy))
    const xIncrement = dx / steps
    const yIncrement = dy / steps
    let result = []
    let x = pointA.x
    let y = pointA.y

    result.push(new Point(Math.round(x), Math.round(y)))

    for (let i = 0; i < steps; i++) {
      x += xIncrement
      y += yIncrement

      result.push(new Point(Math.round(x), Math.round(y)))
    }

    return result
  },

  // Bresenham's Line Algorithm
  line(pointA, pointB) {
    let result = []
    let x0 = pointA.x
    let y0 = pointA.y
    let x1 = pointB.x
    let y1 = pointB.y
    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    const sx = (x0 < x1) ? 1 : -1
    const sy = (y0 < y1) ? 1 : -1
    let err = dx - dy

    while (true) {
      // ctx.fillRect(x0, y0, 1, 1) // Draw the current pixel
      result.push(new Point(x0, y0))

      if (x0 === x1 && y0 === y1) break

      const e2 = 2 * err
      if (e2 > -dy) {
        err -= dy
        x0 += sx
      }
      if (e2 < dx) {
        err += dx
        y0 += sy
      }
    }

    return result
  }
}
// @see https://stackoverflow.com/a/71619350/2379235
const splitEmoji = (string) => [ ...new Intl.Segmenter().segment(string) ].map(x => x.segment)

function copyToClipboard(text) {
  const previousFocus = window.activeElement
  const textarea = document.createElement('textarea')
  textarea.className = 'copy-button-helper'
  textarea.value = text

  document.body.appendChild(textarea)

  textarea.select()
  // For mobile devices
  textarea.setSelectionRange(0, textarea.value.length)
  document.execCommand('copy')
  textarea.remove()

  previousFocus && previousFocus.focus()
}

class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  clone() {
    return new Point(this.x, this.y)
  }
}

class Rectangle extends Point {
  constructor(x, y, width, height) {
    super(x, y)
    this.width = width
    this.height = height
  }

  static fromClientRect(value) {
    return new Rectangle(value.left, value.top, value.width, value.height)
  }

  clone() {
    return new Rectangle(this.x, this.y, this.width, this.height)
  }
}

class Data {
  setup(width = 10, height = 10, blank = DEFAULT_BLANK, separator = '\n') {
    this.width = width
    this.height = height
    this.blank = blank
    this.separator = separator
    this.matrix = new Array(this.height)
    .fill(undefined)
    .map(() => new Array(this.width).fill(blank))
  }

  clear() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.matrix[y][x] = this.blank
      }
    }
  }

  set(x, y, value) {
    if (x >= 0 && x < this.width && y >= 0 || y < this.height) {
      this.matrix[y][x] = value
    } else throw new RangeError('out of range!')
  }

  toString() {
    return this.matrix.reduce(
      (result, line) => result + line.join('') + this.separator,
      ''
    )
  }
}

class DataStorage {
  data = {}

  constructor() {
    this.read()
  }

  static get KEY() {
    return 'emojiPaint'
  }

  read() {
    this.data = JSON.parse(localStorage.getItem(DataStorage.KEY)) ?? {}
  }

  write() {
    localStorage.setItem(DataStorage.KEY, JSON.stringify(this.data))
  }

  getItem(key) {
    return this.data[key]
  }

  setItem(key, value) {
    this.data[key] = value
  }

  mergeItem(key, value) {
    if (value?.constructor === Object || value?.constructor === Array) {
      if (this.data[key]?.constructor === Object) {
        this.data[key] = { ...this.data[key], ...value }
        return
      }

      if (this.data[key]?.constructor === Array) {
        this.data[key] = [ ...this.data[key], ...value ]
        return
      }

      this.setItem(key, value)
    }
  }
}

class Metrics {
  constructor(data = DEFAULT_BLANK) {
    this.rectangle = new Rectangle(0, 0, 0, 0)
    this.element = document.createElement('div')
    this.element.classList.add('emoji-paint__metrics')
    this.element.innerText = data
  }

  measure() {
    document.body.appendChild(this.element)
    this.rectangle = new Rectangle(0, 0, this.element.offsetWidth, this.element.offsetHeight)
    document.body.removeChild(this.element)

    return this.rectangle
  }
}

class Toolbar {
  items = {}
  countSeparator = 0
  countSpacer = 0

  constructor(className) {
    this.element = document.createElement('div')
    this.element.classList.add('component-toolbar', className)
  }

  attachItem(identifier, element) {
    this.items[identifier] = element
    this.element.append(element)
  }

  attachSeparator() {
    const separator = document.createElement('hr')

    separator.classList.add('emoji-paint__toolbar-separator')

    this.attachItem(`separator-${this.countSeparator++}`, separator)
  }

  attachSpacer() {
    const spacer = document.createElement('div')

    spacer.classList.add('emoji-paint__toolbar-spacer')

    this.attachItem(`spacer-${this.countSpacer++}`, spacer)
  }
}

class ToolbarTop extends Toolbar {
  constructor(paint) {
    super('emoji-paint__toolbar-top')
    this.paint = paint
    this.setup()
  }

  setup() {
    this.setupBtnCopy()
    this.attachSpacer()
    this.setupNew()
    this.attachSeparator()
    this.setupBtnClear()
  }

  setupNew() {
    const containerNew = document.createElement('div')
    const label = document.createElement('span')
    const inputWidth = document.createElement('input')
    const inputHeight = document.createElement('input')
    const btnNew = document.createElement('button')

    containerNew.classList.add('emoji-paint__toolbar-top-new')

    label.classList.add('emoji-paint__toolbar-label')
    label.innerText = 'Size'

    inputWidth.type = inputHeight.type = 'number'
    inputWidth.value = this.paint.width
    inputHeight.value = this.paint.height

    btnNew.classList.add(
      'emoji-paint__toolbar-top-btn-new',
      'emoji-paint__icon-btn'
    )
    btnNew.title = 'New Canvas'
    btnNew.innerText = '💥️'
    btnNew.addEventListener('click', () => {
        this.paint.canvas.setup(
          parseInt(inputWidth.value),
          parseInt(inputHeight.value)
        )
      }
    )

    containerNew.append(label, inputWidth, inputHeight, btnNew)

    this.attachItem('new', containerNew)
  }

  setupBtnClear() {
    const btnClear = document.createElement('button')

    btnClear.classList.add(
      'emoji-paint__toolbar-top-btn-clear',
      'emoji-paint__icon-btn'
    )
    btnClear.title = 'Clear Canvas'
    btnClear.innerText = '❌'
    btnClear.addEventListener('click', () => {
      this.paint.canvas.clear()
    })

    this.attachItem('btnCopy', btnClear)
  }

  setupBtnCopy() {
    const btnCopy = document.createElement('button')

    btnCopy.classList.add(
      'emoji-paint__toolbar-top-btn-copy',
      'emoji-paint__icon-btn'
    )
    btnCopy.title = 'Copy to Clipboard'
    btnCopy.innerText = '📋'
    btnCopy.addEventListener('click', () => {
      copyToClipboard(this.paint.canvas.data.toString())
    })

    this.attachItem('btnCopy', btnCopy)
  }
}

class Palette {
  static ITEM_ID = 'emoji-paint__palette-item'
  elements = {
    container: null,
    items: null,
  }
  editor = null
  dropdown = null
  paletteCurrent = null
  palettes = null
  selection = null
  storage = null

  constructor(storage = null) {
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onDropdownChange = this.onDropdownChange.bind(this)
    this.onEditorChange = this.onEditorChange.bind(this)

    document.addEventListener('paletteDropdownChange', this.onDropdownChange)
    document.addEventListener('paletteEditorChange', this.onEditorChange)

    this.storage = storage
    this.palettes = structuredClone(DEFAULT_PALETTES)

    let palettesStored = this.storage.getItem(Palette.STORAGE_KEY) ?? []

    // FIXME: Rewrite old palette structure before ed81e83c0f487524d642cabb97d27bbce0621103
    if (palettesStored.constructor === Object) {
      const oldFormatPalettes = palettesStored

      palettesStored = []

      for (const [ name, value ] of Object.entries(oldFormatPalettes)) {
        palettesStored.push({ name, entries: [ ...value ] })
      }

      this.storage.setItem(Palette.STORAGE_KEY, palettesStored)
      this.storage.write()
    }

    palettesStored.forEach((palette) => {
      const index = this.palettes.findIndex((paletteDefault) => paletteDefault.name === palette.name)

      if (index < 0) {
        this.palettes.push(palette)
        return
      }

      this.palettes[index] = palette
    })

    this.paletteCurrent = this.palettes.at(0)

    const container = this.elements.container = document.createElement('div')
    const items = this.elements.items = document.createElement('div')

    container.classList.add('emoji-paint__palette')

    items.classList.add('emoji-paint__palette-items')
    items.addEventListener('mousedown', this.onMouseDown)
    items.addEventListener('contextmenu', (event) => event.preventDefault())

    this.selection = new PaletteSelection(this)
    this.dropdown = new PaletteDropdown()
    this.editor = new PaletteEditor(this)

    container.append(
      this.selection.elements.container,
      this.dropdown.element,
      this.editor.elements.container,
      items
    )

    this.dropdown.setup(this.palettes)
  }

  static get STORAGE_KEY() {
    return 'palettes'
  }

  setup() {
    const { items } = this.elements

    while (items.childElementCount) {
      items.removeChild(items.lastChild)
    }

    const itemsNew = this.paletteCurrent.entries.map((entry, index) => {
      const item = document.createElement('input')

      item.classList.add(Palette.ITEM_ID)
      item.type = 'radio'
      item.name = Palette.ITEM_ID
      item.value = entry
      item.dataset.index = index.toString()

      return item
    })

    items.append(...itemsNew)

    const event = new CustomEvent(
      'paletteChange', {
        bubbles: true,
        cancelable: false,
        detail: { palette: this.paletteCurrent }
      }
    )
    this.elements.container.dispatchEvent(event)

    this.select()
  }

  select(index = 0, mouseButton = 0) {
    const { items } = this.elements

    if (!(index in items.children)) {
      return
    }

    const selected = this.paletteCurrent.entries[index]
    const item = items.children.item(index)

    item.checked = true


    const detail = { index, mouseButton, selected }
    const eventChange = new CustomEvent('paletteSelectionChange', {
      bubbles: true,
      cancelable: false,
      detail
    })
    this.elements.container.dispatchEvent(eventChange)
  }

  onMouseDown(event) {
    this.select(
      parseInt(event.target.dataset.index),
      event.button
    )
  }

  onDropdownChange(event) {
    this.paletteCurrent = this.palettes.find((palette) => palette.name === event.detail.paletteName)
    this.setup()
  }

  onEditorChange(event) {
    const paletteCurrent = this.paletteCurrent = event.detail.palette
    const paletteDefault = DEFAULT_PALETTES.find((palette) => palette.name === paletteCurrent.name)
    let palettesStored = this.storage.getItem(Palette.STORAGE_KEY) ?? []

    // Replace previous palette item with changed one
    this.palettes = this.palettes.map(
      (palette) => (palette.name === paletteCurrent.name)
        ? paletteCurrent
        : palette
    )

    const isDefault = (
      paletteCurrent.entries.length === paletteDefault.entries.length
      && paletteCurrent.entries.every((entry, index) => entry === paletteDefault.entries.at(index))
    )

    if (isDefault) {
      // TODO: Implement delete or so in storage
      palettesStored = palettesStored.filter((palette) => palette.name !== paletteCurrent.name)
    } else {
      // TODO: Simplify merge
      const indexStored = palettesStored.findIndex((paletteStored) => paletteStored.name === paletteCurrent.name)

      if (indexStored > -1) {
        palettesStored.splice(indexStored, 1, paletteCurrent)
      } else {
        palettesStored.push(paletteCurrent)
      }
    }

    this.storage.setItem(
      Palette.STORAGE_KEY,
      palettesStored
    )

    this.storage.write()
    this.setup()
  }
}

class PaletteDropdown {
  constructor() {
    this.onChange = this.onChange.bind(this)

    this.element = document.createElement('select')
    this.element.classList.add('emoji-paint__palette_dropdown')
    this.element.addEventListener('change', this.onChange)
  }

  setup(palettes = DEFAULT_PALETTES) {
    while (this.element.childElementCount) {
      this.element.removeChild(this.element.firstChild)
    }

    const options = palettes.map((palette) => {
      const option = document.createElement('option')

      option.text = option.value = palette.name

      return option
    })

    this.element.append(...options)
  }

  dispatchChange() {
    const option = this.element.selectedOptions.item(0)
    const detail = { paletteName: option.value }
    const event = new CustomEvent('paletteDropdownChange', {
      bubbles: true,
      cancelable: false,
      detail
    })

    this.element.dispatchEvent(event)
  }

  onChange() {
    this.dispatchChange()
  }
}

class PaletteSelection {
  value = { left: DEFAULT_BLANK, right: DEFAULT_BLANK }
  elements = { container: null, selectionLeft: null, selectionRight: null }

  constructor() {
    this.onPaletteSelectionChange = this.onPaletteSelectionChange.bind(this)

    const container = this.elements.container = document.createElement('div')
    const selectionLeft = this.elements.selectionLeft = document.createElement('div')
    const selectionRight = this.elements.selectionRight = document.createElement('div')

    container.classList.add('emoji-paint__palette-selection')

    selectionLeft.classList.add('emoji-paint__palette-selection-left')
    selectionLeft.textContent = DEFAULT_BLANK
    selectionLeft.title = 'Left mouse button'

    selectionRight.classList.add('emoji-paint__palette-selection-right')
    selectionRight.textContent = DEFAULT_BLANK
    selectionRight.title = 'Right mouse button'

    container.append(selectionLeft, selectionRight)

    document.addEventListener(
      'paletteSelectionChange',
      this.onPaletteSelectionChange
    )
  }

  onPaletteSelectionChange(event) {
    const { selectionLeft, selectionRight } = this.elements
    const { selected, mouseButton } = event.detail

    switch (mouseButton) {
      default:
        this.value.left = selected
        selectionLeft.textContent = selected
        break

      case 2:
        this.value.right = selected
        selectionRight.textContent = selected
        break
    }
  }
}

class PaletteEditor {
  elements = {
    container: null,
    btnEdit: null,
    btnReset: null,
    inputEdit: null
  }
  valueCurrent = null

  constructor(palette) {
    this.onBtnEditClick = this.onBtnEditClick.bind(this)
    this.onBtnResetClick = this.onBtnResetClick.bind(this)
    this.onInputEditBlur = this.onInputEditBlur.bind(this)
    this.onInputEditKeyPress = this.onInputEditKeyPress.bind(this)
    this.onPaletteChange = this.onPaletteChange.bind(this)

    document.addEventListener('paletteDropdownChange', this.onPaletteChange)

    this.palette = palette

    const container = this.elements.container = document.createElement('div')
    const btnEdit = this.elements.btnEdit = document.createElement('button')
    const btnReset = this.elements.btnReset = document.createElement('button')
    const inputEdit = this.elements.inputEdit = document.createElement('textarea')

    container.classList.add('emoji-paint__palette-editor')

    btnEdit.classList.add(
      'emoji-paint__palette-editor-btn-edit',
      'emoji-paint__icon-btn'
    )
    btnEdit.title = 'Edit palette'
    btnEdit.textContent = '✏️'
    btnEdit.addEventListener('click', this.onBtnEditClick)

    btnReset.classList.add(
      'emoji-paint__palette-editor-btn-reset',
      'emoji-paint__icon-btn'
    )
    btnReset.title = 'Reset palette'
    btnReset.textContent = '🧹'
    btnReset.addEventListener('click', this.onBtnResetClick)

    inputEdit.classList.add('emoji-paint__palette-editor-input-edit')
    inputEdit.addEventListener('blur', this.onInputEditBlur)
    inputEdit.addEventListener('keypress', this.onInputEditKeyPress)

    container.append(btnEdit, btnReset)

    this.onPaletteChange()
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

  isEmoji(character) {
    return /(?!\d)\p{Emoji}/u.test(character)
  }

  dispatchChange(value = this.elements.inputEdit.value) {
    const palette = {
      name: this.palette.paletteCurrent.name,
      entries: [ ...new Set(splitEmoji(value)) ]
    }
    const valueNew = palette.entries.join('')
    const changed = (this.valueCurrent !== valueNew)

    if (!changed) {
      return
    }

    const detail = { palette }
    const event = new CustomEvent(
      'paletteEditorChange',
      { detail, bubbles: true, cancelable: false }
    )

    this.valueCurrent = valueNew
    this.elements.btnReset.disabled = false
    this.elements.container.dispatchEvent(event)
  }

  onBtnEditClick() {
    this.enable()
  }

  onBtnResetClick() {
    const paletteName = this.palette.paletteCurrent.name
    const paletteDefault = DEFAULT_PALETTES.find((palette) => palette.name === paletteName)

    this.dispatchChange(paletteDefault.entries.join(''))
    this.elements.btnReset.disabled = true
  }

  onInputEditKeyPress(event) {
    switch (event.code) {
      default:
        const value = String.fromCharCode(event.charCode)

        if (!this.isEmoji(value)) {
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

  onPaletteChange() {
    const paletteCurrent = this.palette.paletteCurrent
    const paletteDefault = DEFAULT_PALETTES.find((palette) => palette.name === paletteCurrent.name)

    this.elements.btnReset.disabled = (!paletteDefault)
      || (
        paletteCurrent.entries.length === paletteDefault.entries.length
        && paletteCurrent.entries.every((entry, index) => entry === paletteDefault.entries.at(index))
      )

    this.valueCurrent = paletteCurrent.entries.join('')
  }
}

class MouseGrid {
  setup(gridRect, cellRect) {
    this.gridRect = gridRect
    this.cellRect = cellRect
  }

  isValidCoordinate(x, y) {
    return (x >= 0 && x <= this.gridRect.width
      && y >= 0 && y <= this.gridRect.height)
  }

  getPointFromCoordinate(x, y) {
    if (!this.isValidCoordinate(x, y)) {
      return null
    }

    return new Point(
      Math.floor(x / this.cellRect.width),
      Math.floor(y / this.cellRect.height)
    )
  }

  getPointFromEvent(event) {
    return this.getPointFromCoordinate(
      event.offsetX - this.gridRect.x,
      event.offsetY - this.gridRect.y
    )
  }
}

class Tool {
  constructor(canvas, palette) {
    this.canvas = canvas
    this.palette = palette
    this.button = 0
    this.isMouseDown = false
    this.point = null
    this.prevPoint = null
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }

  activate() {
    const e = this.canvas.element
    e.addEventListener('mousedown', this.onMouseDown)
    e.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('mouseup', this.onMouseUp)
  }

  deactivate() {
    const e = this.canvas.element
    e.removeEventListener('mousedown', this.onMouseDown)
    e.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseup', this.onMouseUp)
  }

  apply(event) {
    const point = this.canvas.mouseGrid.getPointFromEvent(event)

    if (!point || point.x > this.canvas.width - 1 || point.y > this.canvas.height - 1) {
      return false
    }

    this.prevPoint = this.point
    this.point = point

    return !!this.point
    // Implement in child class
  }

  onMouseDown(event) {
    this.button = event.button
    this.isMouseDown = true
    this.apply(event)
  }

  onMouseMove(event) {
    if (this.isMouseDown) {
      this.apply(event)
    }
  }

  onMouseUp() {
    if (this.isMouseDown) {
      this.isMouseDown = false
      this.point = null
      this.prevPoint = null
    }
  }
}

class DrawTool extends Tool {
  apply(event) {
    if (super.apply(event)) {
      const points = DRAW_FUNCTIONS.line(
        this.prevPoint ?? this.point,
        this.point
      )
      const value = (this.button === 2)
        ? this.palette.selection.value.right
        : this.palette.selection.value.left

      this.canvas.draw.apply(
        this.canvas,
        [ value, ...points ]
      )
    }
  }
}

class Canvas {
  constructor() {
    this.data = new Data()
    this.metrics = new Metrics()

    this.element = document.createElement('div')
    this.element.classList.add('emoji-paint__canvas')
    this.element.addEventListener('contextmenu', (event) => event.preventDefault())
  }

  setup(width, height) {
    this.width = width
    this.height = height

    const { element, data, metrics } = this

    data.setup(this.width, this.height)
    metrics.measure()

    element.innerText = data.toString()

    this.rectangle = new Rectangle(0, 0, element.clientWidth, element.clientHeight)
    this.mouseGrid = new MouseGrid()
    this.mouseGrid.setup(this.rectangle, this.metrics.rectangle)
  }

  draw(value, ...points) {
    points.forEach((point) => this.data.set(point.x, point.y, value))
    this.element.innerText = this.data.toString()
  }

  clear() {
    if (confirm('Are you sure?')) {
      this.data.clear()
      this.element.innerText = this.data.toString()
    }
  }
}

class Paint {
  elements = { container: null, head: null, body: null }
  toolbars = { top: null }
  width = 10
  height = 10

  constructor(element = document.createElement('div')) {
    this.storage = new DataStorage()
    this.canvas = new Canvas()
    this.palette = new Palette(this.storage)
    this.tool = new DrawTool(this.canvas, this.palette)
    this.toolbars.top = new ToolbarTop(this)

    const { elements } = this
    const container = elements.container = element
    const head = elements.head = document.createElement('div')
    const body = elements.body = document.createElement('div')

    container.classList.add('emoji-paint__container')

    head.classList.add('emoji-paint__head')
    head.innerText = '🎨 EmojiPaint'

    body.classList.add('emoji-paint__body')

    body.append(
      this.toolbars.top.element,
      this.canvas.element,
      this.palette.elements.container,
    )

    container.append(head, body)

    if (!this.elements.container.parentElement) {
      document.body.append(this.elements.container)
    }
  }

  setup(width = 10, height = 10) {
    this.width = width
    this.height = height

    this.canvas.setup(width, height)
    this.palette.setup()
    this.tool.activate()
  }
}

const paint = new Paint(document.getElementById('emojiPaint'))
paint.setup()
