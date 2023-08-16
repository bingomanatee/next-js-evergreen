import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import blockManager from '~/lib/managers/blockManager'
import { planEditorMode } from '~/components/pages/PlanEditor/PlanEditor.state'
import { DIMENSION_ACTIONS, DIMENSION_SELECTORS, dimensionValue } from '~/components/pages/PlanEditor/util'
import { DimensionValue } from '~/types'

export type LinkFrameStateValue = {
  targetFrameId: string | null,
  lockedTarget: string | null
} & DimensionValue;

type leafType = typedLeaf<LinkFrameStateValue>;

const LinkFrameState = (props) => {
  const $value: LinkFrameStateValue = {
    ...dimensionValue(),
    targetFrameId: null,
    lockedTarget: null,
  };
  return {
    name: "LinkFrame",
    $value,

    selectors: {
      ...DIMENSION_SELECTORS
    },

    actions: {
      clearLock(state: leafType) {
        console.log('clearing lock');
        state.do.set_lockedTarget(null);
      },
      lockTarget(state: leafType, id) {
        if (state.value.lockedTarget) {
          return;
        }
        state.do.set_lockedTarget(id);
        state.do.set_lockedTarget(state.value.targetFrameId);
      },

      onMouseEnter(state: leafType, e: MouseEvent) {
        e.stopPropagation()
        const closer = state.getMeta('closer');
        if (closer) clearTimeout(closer);
        const targetId = e.target.dataset['frameContainer'];
        console.log('hovered over', targetId);
        state.do.set_targetFrameId(targetId);
      },
      onMouseLeave(state: leafType) {
        const closer = state.getMeta('closer');
        if (closer) clearTimeout(closer);

        state.setMeta('closer', setTimeout(() => {
          state.do.set_targetFrameId(null);
        }, 1200), true)
      },

      init(state: leafType) {
        // load in the current frame every time the id and mode changes

        return blockManager.select(state.do.updateId, (value) => {
          const { type, data } = value;
          if (type === planEditorMode.LINKING_FRAME) {
            return data.frameId;
          }
          return null;
        });
      },
      ...DIMENSION_ACTIONS
    }
  };
};

export default LinkFrameState;
