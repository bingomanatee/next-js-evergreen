import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import blockManager from '~/lib/managers/blockManager'
import { planEditorMode } from '~/components/pages/PlanEditor/PlanEditor.state'
import { DIMENSION_ACTIONS, DIMENSION_SELECTORS, dimensionValue } from '~/components/pages/PlanEditor/util'
import { DimensionValue, Direction, LFSummary } from '~/types'
import dataManager from '~/lib/managers/dataManager'
import { Vector2 } from 'three'
import { frameToPoint } from '~/lib/utils/px'
import { boolean } from 'zod'
import { frameId } from 'three/examples/jsm/nodes/shadernode/ShaderNodeElements'

export type LinkFrameStateValue = {
  spriteDir: Direction | null,
  planId: string,
} & DimensionValue;

type leafType = typedLeaf<LinkFrameStateValue>;

const LinkFrameState = () => {
  const $value: LinkFrameStateValue = {
    ...dimensionValue(),
    spriteDir: null,
    planId: ''
  };
  return {
    name: "LinkFrame",
    $value,

    selectors: {
      ...DIMENSION_SELECTORS,

      style(state: leafType, dir: Direction, POINT_OFFSET: Vector2, isEnd: boolean) {

        if (isEnd) {
          return state.child('target')!.$.point(dir, POINT_OFFSET);
        }

        return state.$.point(dir, POINT_OFFSET)
      }
    },

    actions: {
      async save(state: leafType, params: LFSummary) {
        console.log('saving line:', params, 'with', state.value.planId);
        const { id, spriteDir, targetId, targetSpriteDir } = params;
        if (id && spriteDir && targetId && targetSpriteDir) {
          await dataManager.do(async (db) => {
            return db.links.addLink(state.value.planId, params);
          });
        }
        blockManager.do.finish();
      },
      clearLock(state: leafType) {
        console.log('clearing lock');
        state.do.set_lockedTarget(null);
      },
      lockTarget(state: leafType) {
        console.log('locking target');
        state.child('target')!.do.set_locked(true);
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
        console.log('onMouseEnter:', targetId, target.value);

        if (target.value.locked) {
          return;
        }

        const closer = state.getMeta('closer');
        if (closer) {
          clearTimeout(closer);
        }
        target.do.updateId(targetId);
      },
      onMouseLeave(state: leafType, e: MouseEvent) {
        e.stopPropagation();

        const target = state.child('target')!;
        if (target.value.locked) {
          return;
        }

        const closer = state.getMeta('closer');
        if (closer) {
          clearTimeout(closer);
        }

        state.setMeta('closer', setTimeout(() => {
          if (!target.value.locked) {
            target.do.clear();
          }
        }, 1200), true)
      },

     async init(state: leafType, planEditorState: leafI) {
        // load in the current frame every time the id and mode changes
        const frameId = blockManager.value.data.frameId;
        console.log('line editor initializing in plan ',
          planEditorState.value.planId, 'for frame', frameId);
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
          spriteDir: null
        },

        selectors: {
          point(state: leafI, dir: Direction, offset: Vector2) {
            const { frame } = state.value;
            if (!frame) {
              return new Vector2(0, 0);
            }
            return frameToPoint(frame, dir, offset);
          }
        },

        actions: {
          spriteClicked(state: leafI, dir: Direction) {
            state.do.set_spriteDir(dir);
          },
          updateId(state: leafI, id, locked) {
            console.log('setting target id:', id);
            state.do.set_id(id);
            state.do.set_locked(!!locked);
            state.do.loadFrame();
          },
          clear(state: leafI) {
            state.do.set_id(null);
            state.do.set_frame(null);
          },
          loadFrame(state: leafI) {
            const { id, frame } = state.value;
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
