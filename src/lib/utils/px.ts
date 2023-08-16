import { Vector2 } from 'three'
import { Frame } from '~/types'

export default function px(n: number): string {
  if (!(n && (typeof n === 'number'))) {
    return '0';
  }
  return `${Math.round(n)}px`
}

export function vectorToStyle(p: Vector2) {
  let out: { left?: string, top?: string, width?: string, height?: string } = {};
  if (p.x) {
    out.left = px(p.x);
  }
  if (p.y) {
    out.top = px(p.y);
  }
  return out;
}


export function frameToStyle(f: Frame) {
  return {
    left: px(f.left),
    top: px(f.top),
    width: px(f.width),
    height: px(f.height)
  }
}
