export class Collection extends Array {
  constructor(identifier, entries = []) {
    super(...entries)
    this.identifier = identifier
  }

  has(identifierValue) {
    return (this.findIndex(
      value => value[this.identifier] === identifierValue
    ) > -1)
  }

  get(identifierValue) {
    return this.find(value => value[this.identifier] === identifierValue)
  }

  set(identifierValue, entry) {
    const index = this.findIndex(
      value => value[this.identifier] === identifierValue
    )

    if (index === -1) {
      this.push({ [this.identifier]: identifierValue, ...entry })
      return
    }

    this[index] = { ...this[index], ...entry }
  }

  merge(entries) {
    for (const entry of entries) {
      this.set(entry[this.identifier], entry)
    }
  }
}
