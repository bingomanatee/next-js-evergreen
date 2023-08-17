import { HORIZ, VERT } from './constants'
import { GenFunction } from '@wonderlandlabs/can-di-land/lib/types'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { MessageTypeValue } from '~/lib/managers/types'

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
  start_frame: string,
  end_frame: string,
  start_at: string,
  end_at: string,
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
  value: MessageTypeValue
}

export type DimensionValue = {
  left: number,
  top: number,
  right: number,
  bottom: number,
  type: string,
  loaded: boolean,
  deltas: Map<string, number>,
  id: string | null
};

export type Area = {
  left: number,
  right: number,
  top: number,
  bottom: number,
}

export enum X_DIR {
  X_DIR_L = 'l',
  X_DIR_C = 'c',
  X_DIR_R = 'r'
}

export const Y_DIR_T = 't'
export const Y_DIR_M = 'm'
export const Y_DIR_B = 'b'

export enum Y_DIR {
  Y_DIR_T = 't',
  Y_DIR_M = 'm',
  Y_DIR_B = 'b'
}

export type Direction = {
  x: X_DIR,
  y: Y_DIR
}

export function isDirection(arg: unknown): arg is Direction {
  return !!(
    arg
    && typeof arg === 'object'
    && isX_DIR(arg.x)
    && isY_DIR(arg.y)
  )
}

export function isX_DIR(arg: unknown): arg is X_DIR {
  return typeof arg === 'string' && ['l', 'c', 'r'].includes(arg);
}

export function isY_DIR(arg: unknown): arg is X_DIR {
  return typeof arg === 'string' && ['t', 'm', 'b'].includes(arg);
}

export function dirToString(dir: Direction) {
  return `${dir.x}-${dir.y}`;
}

export const AllDirections: Map<string, Direction> = new Map();
export type LFSummary = {
  id: string | null,
  spriteDir: Direction | null,
  targetId: string | null,
  targetSpriteDir: Direction | null
}
