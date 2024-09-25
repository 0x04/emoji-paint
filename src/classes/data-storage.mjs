export class DataStorage {
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
