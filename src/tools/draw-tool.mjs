import { Tool } from './tool.mjs'
import * as DRAW_FUNCTIONS from '../constants/draw-functions.mjs'

export class DrawTool extends Tool {
  apply(event) {
    if (super.apply(event)) {
      const value = this.stores.palette.getSelectedEntry(this.button)
      const points = DRAW_FUNCTIONS.line(
        this.prevPoint ?? this.point,
        this.point
      )

      this.stores.canvas.setPoints(value, ...points)
    }
  }
}
