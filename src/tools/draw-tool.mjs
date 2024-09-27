import { Tool } from './tool.mjs'
import * as DRAW_FUNCTIONS from '../constants/draw-functions.mjs'

export class DrawTool extends Tool {
  apply(event) {
    if (super.apply(event)) {
      const { palette: paletteStore } = this.paint.stores
      const { canvas: canvasStore } = this.paint.stores
      const points = DRAW_FUNCTIONS.line(
        this.prevPoint ?? this.point,
        this.point
      )
      const value = paletteStore.getSelectedEntry(this.button)

      canvasStore.setPoints(value, ...points)
    }
  }
}
