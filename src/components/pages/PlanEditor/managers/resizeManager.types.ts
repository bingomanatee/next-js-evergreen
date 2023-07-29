export const X_DIR_L = 'l'
export const X_DIR_C = 'c'
export const X_DIR_R = 'r'

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

export function dirToString(dir: Direction) {
  return `${dir.x}-${dir.y}`;
}

export const AllDirections: Map<string, Direction> = new Map();
[X_DIR.X_DIR_L, X_DIR.X_DIR_C, X_DIR.X_DIR_R].forEach((xDir: X_DIR) => {
  [Y_DIR.Y_DIR_T, Y_DIR.Y_DIR_M, Y_DIR.Y_DIR_B].forEach((yDir: Y_DIR) => {
    const dir: Direction = { x: xDir, y: yDir };
    AllDirections.set(dirToString(dir), dir);
  });
});
