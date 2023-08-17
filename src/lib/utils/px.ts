import { Vector2 } from 'three'
import { Area, Direction, Frame, X_DIR, Y_DIR } from '~/types'

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

export function frameToSize(f: Frame): Area | null {
  if (!f) {
    return null;
  }
  return {
    left: f.left,
    right: f.left + f.width,
    top: f.top,
    bottom: f.top + f.height
  }
}

function avg(a: number, b: number) {
  return Math.round(((a + b) / 2))
}

function areaDirToPoint(size: Area, dir: Direction) {
  let x = 0;
  let y = 0;
  switch (dir.y) {
    case Y_DIR.Y_DIR_B:
      y = size.bottom;
      break;
    case Y_DIR.Y_DIR_M:
      y = avg(size.bottom, size.top);
      break;
    case Y_DIR.Y_DIR_T:
      y = size.top;
      break;
  }
  switch (dir.x) {
    case X_DIR.X_DIR_C:
      x = avg(size.left, size.right);
      break;
    case X_DIR.X_DIR_R:
      x = size.right
      break;
    case X_DIR.X_DIR_L:
      x = size.left;
      break;
  }
  return new Vector2(x, y);
}

export function frameToPoint(f: Frame, dir: Direction, offset?: Vector2) {
  const size = frameToSize(f);
  if (!size) {
    return null;
  }

  const point = areaDirToPoint(size, dir);
  if (offset) {
    return point.add(offset);
  }
  return point;
}
