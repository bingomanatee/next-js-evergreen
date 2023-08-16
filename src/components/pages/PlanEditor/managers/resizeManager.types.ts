import { AllDirections, Direction, dirToString, X_DIR, Y_DIR } from '~/types'

export const X_DIR_L = 'l'
export const X_DIR_C = 'c'
export const X_DIR_R = 'r'

[X_DIR.X_DIR_L, X_DIR.X_DIR_C, X_DIR.X_DIR_R].forEach((xDir: X_DIR) => {
  [Y_DIR.Y_DIR_T, Y_DIR.Y_DIR_M, Y_DIR.Y_DIR_B].forEach((yDir: Y_DIR) => {
    const dir: Direction = { x: xDir, y: yDir };
    AllDirections.set(dirToString(dir), dir);
  });
});
