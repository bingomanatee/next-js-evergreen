import { VERT, HORIZ } from './constants'
import { GenFunction } from '@wonderlandlabs/can-di-land/lib/types'
import { Subject } from 'rxjs'
import { leafI } from '@wonderlandlabs/forest/lib/types'

export type Orientation = HORIZ | VERT
export type FrameType = 'markdown' | 'image' | 'map';
export type Frame = {
  name?: string,
  id: string,
  project_id: number,
  left: number,
  top: number,
  width: number,
  height: number,
  order: number,
  type: FrameType,
  value: string
}

export type Plan = {
  id: string,
  user_id: string,
  created?: number
}

export type Link = {
  id: string,
  project_id: number,
  from_frame: string,
  to_frame: string
}

export const isPromise = (input: any): input is Promise<any> => {
  return input && (typeof input.then === 'function')
    && (typeof input.catch === 'function')
    && (typeof input.finally === 'function')
}

type DialogEvtType = 'close' | 'save';
export type DialogEvt = {
  type: DialogEvtType
}

export type DialogView = {
  close: GenFunction;
  save: GenFunction;
  dialogState: leafI
}
