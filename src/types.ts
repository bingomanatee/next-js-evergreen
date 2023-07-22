import { VERT, HORIZ } from './constants'
import { GenFunction } from '@wonderlandlabs/can-di-land/lib/types'
import { Subject } from 'rxjs'

export type Orientation = HORIZ | VERT
export type FrameType = 'markdown' | 'image' | 'map';
export type FrameContentBase = {
  type: FrameType
}
export type MarkdownContent = FrameContentBase & { type: 'markdown', content?: string };
export type ImageContent = FrameContentBase & {type: 'image'};
export type MapContent = FrameContentBase & {type: 'map'};
export type FrameContent = MarkdownContent | ImageContent | MapContent
export type Frame = {
  name?: string,
  id: string,
  left: number,
  top: number,
  width: number,
  height: number,
  order: number,
  projectId: number,
  content?: FrameContent
}

export type Plan = {
  id: string,
  user_id: string,
  created?: number
}

const isPromise = (input: any): input is Promise<any> => {
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
  dialogStream: Subject<DialogEvt>
}
