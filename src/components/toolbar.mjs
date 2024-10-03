export class Toolbar {
  element = null
  items = {}
  countSeparator = 0
  countSpacer = 0

  constructor(className) {
    this.element = document.createElement('div')
    this.element.classList.add('component-toolbar', className)
  }

  appendItem(identifier, element) {
    this.items[identifier] = element
    this.element.append(element)
  }

  appendSeparator() {
    const separator = document.createElement('hr')

    separator.classList.add('emoji-paint__toolbar-separator')

    this.appendItem(`separator-${this.countSeparator++}`, separator)
  }

  appendSpacer() {
    const spacer = document.createElement('div')

    spacer.classList.add('emoji-paint__toolbar-spacer')

    this.appendItem(`spacer-${this.countSpacer++}`, spacer)
  }
}
