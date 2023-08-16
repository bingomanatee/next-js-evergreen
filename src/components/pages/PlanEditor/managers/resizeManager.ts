import dataManager from '~/lib/managers/dataManager'
import { Direction, dirToString, Frame, X_DIR, Y_DIR, Y_DIR_B, Y_DIR_M, Y_DIR_T } from '~/types'
import { leafConfig, leafI } from '@wonderlandlabs/forest/lib/types'
import { Vector2 } from 'three'
import px from '~/lib/utils/px'
import {
  X_DIR_C,
  X_DIR_L,
  X_DIR_R
} from '~/components/pages/PlanEditor/managers/resizeManager.types'
import { RefObject } from 'react'
import { state } from 'sucrase/dist/types/parser/traverser/base'


function frameDirX(xDir: X_DIR, frame?: Frame) {
  if (!frame) {
    return 0;
  }
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
  if (!frame) {
    return 0;
  }
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

const topLeftDir = dirToString({ x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_T });
const topCenterDir = dirToString({ x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_T });
const topRightDir = dirToString({ x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_T });

const midLeftDir = dirToString({ x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_M });
const midRightDir = dirToString({ x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_M });

const bottomLeftDir = dirToString({ x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_B });
const bottomCenterDir = dirToString({ x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_B });
const bottomRightDir = dirToString({ x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_B });

// deprecated

function resizeManagerFactory(id: string): leafConfig {
  return {
    $value: {
      [X_DIR_L]:0,
      [X_DIR_C]: 0,
      [X_DIR_R]: 0,

      [Y_DIR_T]: 0,
      [Y_DIR_M]: 0,
      [Y_DIR_B]: 0,
      id,
      startPoint: new Vector2(),
      offset: new Vector2(),
      offsetDir: '',
      dragId: '',
    },
    actions: {
      initDrag(state: leafI, e: MouseEvent, targetId) {
        e.stopPropagation();
        if (state.value.dragId) { // dragging already
          return;
        }
        console.log('-------------- dragging', targetId);
        const startPoint = new Vector2(e.pageX, e.pageY);
        state.do.set_startPoint(startPoint);
        state.do.set_dragId(targetId);

        window.addEventListener('mousemove', state.do.spriteMouseMoveListener, { capture: true });
        window.addEventListener('mouseup', state.do.spriteMouseUpListener, { once: true });
      },
      spriteMouseMoveListener(state: leafI, e: MouseEvent) {
        e.stopPropagation();
        if (state.value.targetId) {
          console.log('dragging ', state.value.targetId, e.pageX, e.pageY);
        }
        /*//@ts-ignore
        const { name } = e.target.dataset;
        console.log('sprite move of ', name);
        const currentPoint = new Vector2(e.pageX, e.pageY);
        const offset = currentPoint.clone().sub(state.value.startPoint).round();

        state.do.set_offset(offset);
        state.do.set_offsetDir(name); //@TODO: attach name as a data property*/
      },
      spriteMouseUpListener(state: leafI, e: MouseEvent) {
        e.stopPropagation();

        window.removeEventListener('mousemove', state.do.spriteMouseMoveListener);
        window.removeEventListener('mouseup', state.do.spriteMouseUpListener);
        console.log('--- terminating drag of ', state.value.dragId);
      },
      updateId(state: leafI, id: string) {
        state.do.set_id(id);
        state.do.readFrame();
      },

      async readFrame(state: leafI, id: string) {
        const frame = await state.$.frame();
        if (state.value.id === id) {
          // has not been synchronously changed
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
      }
    },
    selectors: {
      offsetMap(state: leafI) {
        const map = new Map<string, number>();
        const { offset, offsetDir } = state.value;
        switch (offsetDir) {
          case topLeftDir:
            map.set(X_DIR.X_DIR_L, offset.x);
            map.set(Y_DIR.Y_DIR_T, offset.y);
            break;

          case topCenterDir:
            map.set(Y_DIR.Y_DIR_T, offset.y);
            break;

          case topRightDir:
            map.set(X_DIR.X_DIR_R, offset.x);
            map.set(Y_DIR.Y_DIR_T, offset.y);
            break;

          case bottomLeftDir:
            map.set(X_DIR.X_DIR_L, offset.x);
            map.set(Y_DIR.Y_DIR_B, offset.y);
            break;

          case bottomCenterDir:
            map.set(Y_DIR.Y_DIR_B, offset.y);
            break;

          case bottomRightDir:
            map.set(X_DIR.X_DIR_R, offset.x);
            map.set(Y_DIR.Y_DIR_B, offset.y);
            break;

          case midLeftDir:
            map.set(X_DIR.X_DIR_L, offset.x);
            break;

          case midRightDir:
            map.set(X_DIR.X_DIR_R, offset.x);
            break;
        }
        return map;
      }
      ,
      posStyle(state: leafI, dir: Direction, ref
      ) {

        let left = state.value[dir.x];
        let top = state.value[dir.y];
        if (ref?.current) {
          const rect = ref.current.getBoundingClientRect();
          let { width, height } = rect;

          const offsetMap = state.$.offsetMap();
          if (offsetMap.size) {
            console.log(state.value.offsetDir, 'map is ', offsetMap);
            offsetMap.forEach((value, field) => {
              switch (field) {
                case X_DIR.X_DIR_R:
                  width += value;
                  break;

                case X_DIR.X_DIR_L:
                  left += value;
                  break;

                case Y_DIR.Y_DIR_B:
                  width += value;
                  break;

                case Y_DIR.Y_DIR_T:
                  height += value;
                  break;
              }
            });
          }

          switch (dir.x) {
            case X_DIR.X_DIR_L:
              left -= width;
              break;

            case X_DIR.X_DIR_C:
              left = Math.round(left - width / 2);
              break;
          }

          switch (dir.y) {
            case Y_DIR.Y_DIR_T:
              top -= height;
              break;

            case Y_DIR.Y_DIR_M:
              top = Math.round(top - height / 2);
              break;
          }
        }
        return { left: px(left), top: px(top) }
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
