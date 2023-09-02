import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { BlockMode, DimensionValue, Direction, Frame, X_DIR, Y_DIR } from '~/types'
import { Vector2 } from 'three'
import dataManager from '~/lib/managers/dataManager'
import blockManager from '~/lib/managers/blockManager'
import { DIMENSION_ACTIONS, DIMENSION_SELECTORS, dimensionValue } from '~/components/pages/PlanEditor/util'

type leafType = typedLeaf<DimensionValue>;

const MoveFrameViewState = (props, planEditorState) => {
  const $value: DimensionValue = {
    ...dimensionValue()
  };

  return {
    $value,
    actions: {
      ... DIMENSION_ACTIONS,

      init(state: leafType) {
        // load in the current frame every time the id and mode changes
        const { type, data } = blockManager.value;
        //@TODO: validate move state?
        state.do.updateId(data.frameId);
      },
      /**
       * save the frame with the dimensions' information
       * @param state
       */
      async updateFrame(state: leafI) {
        if (!state.value.id) {
          return;
        }
        const update = {
          left: state.$.left(),
          top: state.$.top(),
          width: state.$.width(),
          height: state.$.height()
        }
        const frame = await state.$.frame();
        try {
          await frame?.incrementalPatch(update);
        } catch (err) {
          console.error('cannot incremental update ', update, 'frame', frame, err);
        }
        
        state.do.set_deltas(new Map());
        state.do.updateId(frame.id);

      },
    },
    selectors: {
      ...DIMENSION_SELECTORS
    },
    meta: {
      planEditorState
    }
  }
};

export default MoveFrameViewState;
