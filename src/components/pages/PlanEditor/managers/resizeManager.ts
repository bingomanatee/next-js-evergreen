import dataManager from '~/lib/managers/dataManager'
import { Frame } from '~/types'
import { leafConfig, leafI } from '@wonderlandlabs/forest/lib/types'
import { Vector2 } from 'three'
import px from '~/lib/utils/px'
import {
  Direction,
  X_DIR,
  X_DIR_C,
  X_DIR_L,
  X_DIR_R,
  Y_DIR,
  Y_DIR_B,
  Y_DIR_M,
  Y_DIR_T
} from '~/components/pages/PlanEditor/managers/resizeManager.types'
import { right } from '@popperjs/core'


function frameDirX(xDir: X_DIR, frame?: Frame) {
  if (!frame) return 0;
  let x;
  switch (xDir) {
    case X_DIR.X_DIR_L:
      x = frame.left;
      break;
    case X_DIR.X_DIR_C:
      x = Math.round(frame.left + (frame.width / 2));
      break;
    case X_DIR.X_DIR_R:
      x = frame.left + frame.width;
      break;
  }
  return x;
}

function frameDirY(yDir: Y_DIR, frame?: Frame) {
  if (!frame) return 0;
  let y;
  switch (yDir) {
    case Y_DIR.Y_DIR_T:
      y = frame.top;
      break;
    case Y_DIR.Y_DIR_M:
      y = Math.round(frame.top + (frame.height / 2));
      break;
    case Y_DIR.Y_DIR_B:
      y = frame.top + frame.height;
      break;
  }
  return y;
}

async function resizeManagerFactory(id: string): Promise<leafConfig> {
  const frame: Frame = await dataManager.do((db) => db.frames.fetch(id));
  let x = 0;
  let y = 0;
  return {
    $value: {
      [X_DIR_L]: frameDirX(X_DIR.X_DIR_L, frame),
      [X_DIR_C]: frameDirX(X_DIR.X_DIR_C, frame),
      [X_DIR_R]: frameDirX(X_DIR.X_DIR_R, frame),

      [Y_DIR_T]: frameDirY(Y_DIR.Y_DIR_T, frame),
      [Y_DIR_M]: frameDirY(Y_DIR.Y_DIR_M, frame),
      [Y_DIR_B]: frameDirY(Y_DIR.Y_DIR_B, frame),
      id
    },
    actions: {
      async updateId(state: leafI, id: string) {
        const frame = await state.$.frame();
        state.value = {
          ...state.value,
          [X_DIR_L]: frameDirX(X_DIR.X_DIR_L, frame),
          [X_DIR_C]: frameDirX(X_DIR.X_DIR_C, frame),
          [X_DIR_R]: frameDirX(X_DIR.X_DIR_R, frame),

          [Y_DIR_T]: frameDirY(Y_DIR.Y_DIR_T, frame),
          [Y_DIR_M]: frameDirY(Y_DIR.Y_DIR_M, frame),
          [Y_DIR_B]: frameDirY(Y_DIR.Y_DIR_B, frame),
          id
        };
      }
    },
    selectors: {
      posStyle(state: leafI, dir: Direction, ref) {
        let left = state.value[dir.x];
        let top = state.value[dir.y];
        if (ref?.current) {
          const rect = ref.current.getBoundingClientRect();
          const {width, height} = rect;

          switch(dir.x) {
            case X_DIR.X_DIR_L:
              left -= width;
            break;

            case X_DIR.X_DIR_C:
              left = Math.round(left - width/2);
              break;
          }

          switch (dir.y) {
            case Y_DIR.Y_DIR_T:
              top -= height;
              break;

            case Y_DIR.Y_DIR_M:
              top = Math.round(top - height/2);
              break;
          }
        }


        return {left: px(left), top: px(top)}
      },
      v(state: leafI, dir: Direction) {
        return new Vector2(state.value[dir.x], state.value[dir.y])
      },
      async frame(state: leafI) {
        return await dataManager.do((db) => db.frames.fetch(state.value.id));
      }
    }
  }
}

export default resizeManagerFactory;
