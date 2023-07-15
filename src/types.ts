import { VERT, HORIZ } from './constants'

export type Orientation = HORIZ | VERT

export type Frame = {
  id: string,
  left: number,
  top: number,
  width: number,
  height: number,
  order: number,
  projectId: number,
}
