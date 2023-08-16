import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { DimensionValue, Direction, Frame, X_DIR, Y_DIR } from '~/types'
import { Vector2 } from 'three'
import dataManager from '~/lib/managers/dataManager'
import { planEditorMode } from '~/components/pages/PlanEditor/PlanEditor.state'
import blockManager from '~/lib/managers/blockManager'
import { DIMENSION_ACTIONS, DIMENSION_SELECTORS, dimensionValue } from '~/components/pages/PlanEditor/util'

type leafType = typedLeaf<DimensionValue>;

const MoveFrameViewState = (props) => {
  const $value: DimensionValue = {
    ...dimensionValue()
  };

  return {
    $value,
    actions: {
      init(state: leafType) {
        // load in the current frame every time the id and mode changes

        return blockManager.select(state.do.updateId, (value) => {
          const { type, data } = value;

          console.log('---- block editor watch:', value);
          if (type === planEditorMode.MOVING_FRAME) {
            return data.frameId;
          }
          return null;
        });
      },

      ... DIMENSION_ACTIONS
    },
    selectors: {
      ...DIMENSION_SELECTORS
    }
  }
};

export default MoveFrameViewState;
