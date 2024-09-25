import { Tool } from './tool.mjs'
import * as DRAW_FUNCTIONS from '../constants/draw-functions.mjs'

export class DrawTool extends Tool {
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
