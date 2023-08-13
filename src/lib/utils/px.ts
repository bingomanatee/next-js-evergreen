import { Vector2 } from 'three'

export default function px(n: number): string {
  if (!(n && (typeof n === 'number'))) {
    return '0';
  }
  return `${Math.round(n)}px`
}

export function vectorToStyle(p: Vector2) {
  let out: { left?: string, top?: string } = {};
  if (p.x) {
    out.left = px(p.x);
  }
  if (p.y) {
    out.top = px(p.y);
  }
  return out;
}
