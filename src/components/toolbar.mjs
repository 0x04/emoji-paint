export class Toolbar {
  element = null
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
