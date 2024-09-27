import './style.css'
import { Paint } from './src/components/paint.mjs'
import * as stores from './src/stores/stores.mjs'

import { PersistentStore } from './src/classes/persistent-store.mjs'

window.PersistentStore = PersistentStore

const paint = new Paint(
  document.getElementById('emojiPaint'),
  stores
)

paint.setup()
