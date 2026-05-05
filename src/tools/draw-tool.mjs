import { Tool } from './tool.mjs'
import * as DRAW_FUNCTIONS from '../constants/draw-functions.mjs'
import { matrixToString, mergePointsIntoMatrix } from '../functions/matrix.mjs'

export class DrawTool extends Tool {
  draw(event) {
    const result = super.draw(event)

    if (result) {
      const points = DRAW_FUNCTIONS.line(
        this.prevPoint ?? this.point,
        this.point
      )

      this.pointsToDraw.splice(this.pointsToDraw.length, 0, ...points)

      const { matrix, width, height } = this.stores.canvas.getState()
      const drawMatrix = mergePointsIntoMatrix(
        matrix,
        width,
        height,
        this.getValue(),
        ...this.pointsToDraw
      )

      this.canvas.setContent(matrixToString(drawMatrix))
    }

    return result
  }
}
