import {leafI, typedLeaf} from '@wonderlandlabs/forest/lib/types'
import blockManager from '~/lib/managers/blockManager'
import {DIMENSION_ACTIONS, DIMENSION_SELECTORS, dimensionValue} from '~/components/pages/PlanEditor/util'
import {DimensionValue, Direction, LFSummary, X_DIR, Y_DIR} from '~/types'
import dataManager from '~/lib/managers/dataManager'
import {Vector2} from 'three'
import {frameToPoint} from '~/lib/utils/px'
import stopPropagation from "~/lib/utils/stopPropagation";

export type LinkFrameStateValue = {
  spriteDir: Direction | null,
  planId: string,
} & DimensionValue;

type leafType = typedLeaf<LinkFrameStateValue>;

const LinkFrameState = () => {
  const $value: LinkFrameStateValue = {
    ...dimensionValue(),
    spriteDir: {x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_M},
    planId: ''
  };
  return {
    name: "LinkFrame",
    $value,

    selectors: {
      ...DIMENSION_SELECTORS,

      style(state: leafType, dir: Direction, offset: Vector2, isEnd: boolean, zoom = 100) {

        if (isEnd) {
          return state.child('target')!.$.point(dir, offset, zoom);
        }

        let location = state.$.point(dir, offset, zoom);
        if (offset && zoom) {
          const pointOffset = offset.clone().multiplyScalar(100 / zoom);
          return location.add(pointOffset);
        }

        return location;
      }
    },

    actions: {
      async save(state: leafType, params: LFSummary) {
        const {id, spriteDir, targetId, targetSpriteDir, targetMapPoint} = params;

        if (id && spriteDir && (targetId || targetMapPoint) && targetSpriteDir) {
          await dataManager.do(async (db) => {
            console.log('saving map link:', params);
            return db.links.addLink(params);
          });
        }
        blockManager.do.finish();
      },
      clearLock(state: leafType) {
        state.child('target')!.do.updateId(null, false);
      },
      spriteClicked(state: leafType, dir: Direction, onEnd?: boolean) {
        if (onEnd) {
          state.child('target')!.do.set_spriteDir(dir);
        } else {
          state.do.set_spriteDir(dir);
        }
      },
      onMouseEnter(state: leafType, e: MouseEvent) {
        e.stopPropagation();

        //@ts-ignore
        const targetId = e.target.dataset['frameContainer'];
        const target = state.child('target')!;

        if (target.value.locked && target.value.id) {
          return;
        }

        target.do.updateId(targetId);
      },

      async init(state: leafType, planEditorState: leafI) {
        // load in the current frame every time the id and mode changes
        const frameId = blockManager.value.data.frameId;
        state.do.set_planId(planEditorState.value.planId);
        await state.do.updateId(frameId);
        state.do.set_loaded(true);
      },
      ...DIMENSION_ACTIONS
    },

    children: {
      target: {
        $value: {
          id: null,
          frame: null,
          locked: false,
          spriteDir: {x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_M},
          mapPoint: null,
        },

        selectors: {
          point(state: leafI, dir: Direction, offset: Vector2, zoom = 100) {
            const {frame} = state.value;
            if (!frame) {
              return new Vector2(0, 0);
            }
            const location = frameToPoint(frame, dir);
            if (offset && zoom) {
              const pointOffset = offset.clone().multiplyScalar(100 / zoom);
              return location.add(pointOffset);
            }
            return location;
          }
        },

        actions: {
          spriteClicked(state: leafI, dir: Direction) {
            state.do.set_spriteDir(dir);
          },
          updateId(state: leafI, id, locked) {
            let oldId = state.value.id;
            state.do.set_id(id);
            state.do.set_locked(id && locked);
            if (oldId !== id) state.do.loadFrame();
          },
          clear(state: leafI,) {
            state.do.set_id(null);
            state.do.set_locked(false);
            state.do.set_frame(null);
          },
          clearLock(state: leafI, e) {
            stopPropagation(e);
            state.do.set_locked(false);
          },
          lock(state: leafI, e) {
            stopPropagation(e);
            if (state.value.id) {
              state.do.set_locked(true);
            }
          },
          loadFrame(state: leafI) {
            const {id, frame} = state.value;
            const parentId = state.parent!.value.id;

            if (!id || (id === parentId)) {
              state.do.set_frame(null);
              return;
            }
            if (frame && frame.id === id) {
              return;
            }

            dataManager.do(async (db) => {
              const frame = await db.frames.fetch(id);
              if (frame && frame.id === state.value.id) { // ensure id target has not shifted while retrieving
                state.do.set_frame(frame.toJSON());
              }
            });
          }
        }
      }
    }
  };
};

export default LinkFrameState;
