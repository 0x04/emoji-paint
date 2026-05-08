import { Tool } from './tool.mjs'
import * as DRAW_FUNCTIONS from '../constants/draw-functions.mjs'
import { matrixToString, mergePointsIntoMatrix } from '../functions/matrix.mjs'

export class DrawTool extends Tool {
  draw(event) {
    const result = super.draw(event)

    if (result && this.current) {
      // TODO: Check performance
      const points = DRAW_FUNCTIONS
        .line(
          this.prevPoint ?? this.point,
          this.point
        )
        .filter(pointA => !this.pointsToDraw.some(pointB => pointA.isSame(pointB)))

      this.current.matrix = mergePointsIntoMatrix(
        this.current.matrix,
        this.current.width,
        this.current.height,
        this.getValue(),
        ...points
      )

      this.canvas.setContent(matrixToString(this.current.matrix))
      this.pointsToDraw.splice(this.pointsToDraw.length, 0, ...points)
    }

    return result
  }
}
