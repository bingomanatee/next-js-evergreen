import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import {
  Direction,
  X_DIR,
  Y_DIR,
} from '~/components/pages/PlanEditor/managers/resizeManager.types'
import { Frame } from '~/types'
import { Vector2 } from 'three'
import dataManager from '~/lib/managers/dataManager'
import { planEditorMode } from '~/components/pages/PlanEditor/PlanEditor.state'
import blockManager from '~/lib/managers/blockManager'

export type MoveFrameViewStateValue = {
  left: number,
  top: number,
  right: number,
  bottom: number,
  loaded: boolean,
  deltas: Map<string, number>,
  id: string | null
};


type leafType = typedLeaf<MoveFrameViewStateValue>;

const MoveFrameViewState = (props) => {
  const $value: MoveFrameViewStateValue = {
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    id: '',
    deltas: new Map(),
    loaded: false
  };

  return {
    $value,
    actions: {
      init(state: leafType) {
        // load in the current frame every time the id and mode changes

        const sub = blockManager.select(state.do.updateId, (value) => {
          const {type, data} = value;

          console.log('---- block editor watch:', value);
          if (type === planEditorMode.MOVING_FRAME) {
            return data.frameId;
          }
          return null;
        });

        return sub;
      },

      updateId(state: leafI, id: string) {
        console.log('--- moveFrameView -- loading id ', id);
        state.do.set_id(id);
        state.do.set_loaded(!!id);
        state.do.readFrame(id);
      },
      fromFrame(state: leafI, frame: Frame) {
        state.do.set_left(frame.left);
        state.do.set_top(frame.top);
        state.do.set_right(frame.left + frame.width);
        state.do.set_bottom(frame.top + frame.height);
        state.do.set_loaded(true);
        console.log('loaded mfv from frame:', state.value);
      },

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
        blockManager.do.finish();
        state.do.updateId(null);
        state.do.set_loaded(false);
        state.do.set_deltas(new Map());
        frame?.incrementalPatch(update);
      },

      async readFrame(state: leafI, id: string | null) {
        if (id === null) {
          return;
        }
        const frame = await state.$.frame();
        if (frame && (state.value.id === frame.id)) {
          // has not been synchronously changed
          state.do.fromFrame(frame);
        }
      }
    },
    selectors: {
      async frame(state: leafI) {
        const { id } = state.value;
        if (!id) {
          return null;
        }
        return await dataManager.do((db) => db.frames.fetch(id));
      },
      centerX(state: leafType) {
        return Math.round((state.$.left() + state.$.right()) / 2);
      },
      middleY(state: leafType) {
        return Math.round((state.$.top() + state.$.bottom()) / 2);
      },
      width(state: leafType) {
        return Math.max(0, state.$.right() - state.$.left());
      },
      height(state) {
        return Math.max(0, state.$.bottom() - state.$.top());
      },
      left(state: leafType) {
        const { left, deltas } = state.value;
        return left + (deltas?.get('left') || 0);
      },
      right(state: leafType) {
        const { right, deltas } = state.value;
        return right + (deltas?.get('right') || 0);
      },
      top(state: leafType) {
        const { top, deltas } = state.value;
        return top + (deltas?.get('top') || 0);
      },
      bottom(state: leafType) {
        const { bottom, deltas } = state.value;
        return bottom + (deltas?.get('bottom') || 0);
      },
      point(state: leafType, dir: Direction, offset ?: Vector2) {
        let x = 0;
        let y = 0;
        switch (dir.y) {
          case Y_DIR.Y_DIR_B:
            y = state.$.bottom();
            break;
          case Y_DIR.Y_DIR_M:
            y = state.$.middleY();
            break;
          case Y_DIR.Y_DIR_T:
            y = state.$.top();
            break;
        }
        switch (dir.x) {
          case X_DIR.X_DIR_C:
            x = state.$.centerX();
            break;
          case X_DIR.X_DIR_R:
            x = state.$.right();
            break;
          case X_DIR.X_DIR_L:
            x = state.$.left();
            break;
        }
        let point = new Vector2(x, y);
        if (offset) return point.add(offset);
        return point;
      }
    }
  }
};

export default MoveFrameViewState;
