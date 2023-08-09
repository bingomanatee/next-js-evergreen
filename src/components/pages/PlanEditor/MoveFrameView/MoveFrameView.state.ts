import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import {
  Direction,
  dirToString,
  X_DIR,
  X_DIR_C,
  X_DIR_L,
  X_DIR_R,
  Y_DIR, Y_DIR_B, Y_DIR_M, Y_DIR_T
} from '~/components/pages/PlanEditor/managers/resizeManager.types'
import { Frame } from '~/types'
import { Vector2 } from 'three'
import px from '~/lib/utils/px'
import dataManager from '~/lib/managers/dataManager'
import { planEditorMode } from '~/components/pages/PlanEditor/PlanEditor.state'
import { dirname } from 'vfile/lib/minpath.browser'
import { left } from '@popperjs/core'

export type MoveFrameViewStateValue = {};

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

const MOUSE_MOVE = 'mousemove';

type leafType = typedLeaf<MoveFrameViewStateValue>;

const MoveFrameViewState = (props) => {
    const $value: MoveFrameViewStateValue = {
      [X_DIR_L]: 0,
      [X_DIR_C]: 0,
      [X_DIR_R]: 0,

      [Y_DIR_T]: 0,
      [Y_DIR_M]: 0,
      [Y_DIR_B]: 0,
      id: '',
      startPoint: new Vector2(),
      offset: new Vector2(),
      offsetDir: '',
      dragId: '',
    };

    return {
      $value,
      actions: {

        init(state: leafI, planEditorState) {
          const sub = planEditorState.select((frameId) => {
            if (frameId) {
              console.log('updating frame id:', frameId);
              state.do.updateId(frameId)
            }
          }, (peState) => {
            const { mode, modeTarget } = peState;
            const active = mode === planEditorMode.MOVING_FRAME;
            return active ? modeTarget : null;
          })

          return sub;
        },
        initDrag(state: leafI, e: MouseEvent) {
          e.stopPropagation();
          const offsetDir = e.target.dataset.name;
          if (state.value.dragId) { // dragging already
            return;
          }
          console.log(' ========================= offset dir is ', offsetDir);
          const startPoint = new Vector2(e.pageX, e.pageY);
          state.do.set_startPoint(startPoint);
          state.do.set_offsetDir(offsetDir);
          const moveListener = state.do.spriteMouseMoveListener;

          const spriteMouseUpListener = (e: MouseEvent) => {
            e.stopPropagation();

            window.removeEventListener(MOUSE_MOVE, moveListener);
            console.log('--- terminating drag of ', state.value.dragId);
            state.do.resizeFrame();
          }

          window.addEventListener(MOUSE_MOVE, moveListener);
          window.addEventListener('mouseup', spriteMouseUpListener, { once: true });
        },
        async resizeFrame(state: leafI, e: MouseEvent) {

          const { offsetDir, offset, id } = state.value; // what is being dragged
          const offsetMap = state.$.offsetMap();
          console.log('resizing  frame:', offsetDir, offset);
          let {
            [X_DIR_L]: left, [X_DIR_R]: right, [Y_DIR_T]: top, [Y_DIR_B]: bottom
          } = state.value;

          offsetMap.forEach((value, dirName) => {
            switch (dirName) {
              case X_DIR.X_DIR_L:
                left += value;
                break;

              case X_DIR.X_DIR_R:
                right += value;
                break;

              case Y_DIR.Y_DIR_T:
                top += value;
                break;

              case Y_DIR.Y_DIR_B:
                bottom += value;
                break;
            }
          });

          const width = Math.abs(right - left);
          const height = Math.abs(top - bottom);

          const frame = await state.$.frame();
          frame?.incrementalPatch({ left, top, width, height });
          state.do.set_offset(new Vector2(0,0));
          state.do.fromFrame(frame);
        },

        spriteMouseMoveListener(state: leafI, e: MouseEvent) {
          e.stopPropagation();
          if (state.value.targetId) {
            console.log('dragging ', state.value.offsetDir, e.pageX, e.pageY);
          }
          //@ts-ignore
          const { name } = e.target.dataset;
          console.log('sprite move of ', name, e.target);
          const currentPoint = new Vector2(e.pageX, e.pageY);
          const offset = currentPoint.sub(state.value.startPoint).round();
          console.log('offset is ', offset.x, offset.y);
          state.do.set_offset(offset);
        },
        updateId(state: leafI, id: string) {
          console.log('---- MoveFrameView id = ', id);
          state.do.set_id(id);
          state.do.readFrame(id);
        },
        fromFrame(state: leafI, frame: Frame) {
          state.value = {
            ...state.value,
            [X_DIR_L]: frameDirX(X_DIR.X_DIR_L, frame),
            [X_DIR_C]: frameDirX(X_DIR.X_DIR_C, frame),
            [X_DIR_R]: frameDirX(X_DIR.X_DIR_R, frame),

            [Y_DIR_T]: frameDirY(Y_DIR.Y_DIR_T, frame),
            [Y_DIR_M]: frameDirY(Y_DIR.Y_DIR_M, frame),
            [Y_DIR_B]: frameDirY(Y_DIR.Y_DIR_B, frame),
            id: frame.id
          };
        },
        async readFrame(state: leafI, id: string) {
          const frame = await state.$.frame();
          if (state.value.id === id) {
            // has not been synchronously changed
            state.do.fromFrame(frame);
          } else {
            console.log('readFrame - wrong id ', id, 'compared to value', state.value);
          }
        }
      }
      ,
      selectors: {
        offsetMap(state: leafI) {
          const map = new Map<string, number>();
          const { offset, offsetDir } = state.value;
          console.log('offsetDir:', offsetDir);
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
              console.log('midRight - setting offset x as ', offset.x);
              map.set(X_DIR.X_DIR_R, offset.x);
              break;
          }
          return map;
        },
        posStyle(state: leafI, dir: Direction, ref) {

          let left = state.value[dir.x];
          let top = state.value[dir.y];

          const spriteName = dirToString(dir);

          if (ref?.current) {
            const rect = ref.current.getBoundingClientRect();
            let { width, height } = rect;


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

          const offsetMap = state.$.offsetMap();

          if (offsetMap.size) {
            offsetMap.forEach((value, dirName) => {
              switch (dirName) {
                case X_DIR.X_DIR_L:

                  switch (spriteName) {
                    case topLeftDir:
                      left += value;
                      break;

                    case midLeftDir:
                      left += value;
                      break;

                    case bottomLeftDir:
                      left += value;
                      break;
                    // @TODO: affect middle items too.
                  }

                  break;

                case X_DIR.X_DIR_R:
                  switch (spriteName) {
                    case topRightDir:
                      left += value;
                      break;

                    case midRightDir:
                      left += value;
                      break;

                    case bottomRightDir:
                      left += value;
                      break;
                    // @TODO: affect middle items too.
                  }
                  break;

                case Y_DIR.Y_DIR_T:
                  break;

                case Y_DIR.Y_DIR_B:
                  break;

                default:
                  console.log('unhandled dirName', dirName);
              }
            });
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
;

export default MoveFrameViewState;
