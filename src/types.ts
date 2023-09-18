import {HORIZ, VERT} from './constants'
import {GenFunction} from '@wonderlandlabs/can-di-land/lib/types'
import {leafI} from '@wonderlandlabs/forest/lib/types'
import {MessageTypeValue} from '~/lib/managers/types'
import {Vector2} from "three";
import * as walrus from '@wonderlandlabs/walrus';
import {NumberEnum} from "@wonderlandlabs/walrus/dist/enums";
import {TypeEnum} from "@wonderlandlabs/walrus/dist/enums";

console.log('----walrus', walrus, NumberEnum, TypeEnum);
const {type} = walrus;
// const {TypeEnum, NumberEnum} = walrus.enums;

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

export type Setting = {
  name: string,
  id: string,
  string: string,
  number: number,
  is_number: boolean,
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

export enum FrameTypes {
  markdown = 'markdown',
  image = 'image',
  map = 'map',
  unknown = 'unknown'
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
  cancel: GenFunction;
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

export type MapPoint = {
  frame_id: string,
  plan_id: string,
  id: string,
  lat: number,
  lng: number,
  label?: string,
  x?: number,
  y?: number;
}

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

export function dirToString(dir?: Direction | null, mapPoint?: string | null) {
  if (!(dir || mapPoint)) return ''
  if (mapPoint) return `map-point:${mapPoint}`;
  if (dir) return `${dir.x}-${dir.y}`;
  return '';
}

export const AllDirections: Map<string, Direction> = new Map();
export type LFSummary = {
  id: string | null,
  spriteDir: Direction | null,
  targetId: string | null,
  targetSpriteDir: Direction | null,
  targetMapPoint?: string | null,
  created?: number,
  user_id?: number
}

export enum BlockMode {
  NONE = 'none',
  ADDING_FRAME = 'adding-frame',
  MOVING_FRAME = 'moving-frame',
  LINKING_FRAME = 'linking-frame',
  EDIT_FRAME = 'edit-frame',
  PANNING = 'panning',
  LIST_FRAMES = 'list-frames',
  SETTINGS = 'settings'
}

export enum ProjectSettings {
  GRID_SIZE = "grid-size",
  GRID_SNAP = "grid-snap",
  GRID_SHOW = "grid-show",
}

export type DataStreamItem = {
  frames: Frame[];
  links: Link[];
  framesMap: Map<string, Frame>
  planId: string | null,
  plan: Plan | null,
  settingsMap: Map<string, string | number>
}


const validNumbers = [NumberEnum.decimal, NumberEnum.integer];

export function isValidPoint(point: any): point is Vector2 {
  return (type.describe(point, true) === TypeEnum.object
      && validNumbers.includes(type.describeNumber(point.x))
      && validNumbers.includes(type.describeNumber(point.y))
  )
}
