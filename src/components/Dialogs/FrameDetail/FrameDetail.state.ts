import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import { debounce } from 'lodash'

export type FrameDetailStateValue = {
  loaded: boolean;
  saving: boolean;
};
type leafType = typedLeaf<FrameDetailStateValue>;

const FrameDetailState = (id: string, dialogState: leafI) => {
  const $value: FrameDetailStateValue = {
    loaded: false, saving: false
  };
  return {
    name: "FrameDetail",
    $value,

    selectors: {},

    children: {
      frame: {
        $value: {
          id: '',
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          type: 'markdown',
          value: ''
        }
      }
    },

    actions: {
      async initData(state: leafType) {
        const db = await dataManager.db();
        const frame = await db.frames.findByIds([id]).exec();
        const myFrame = frame.get(id);
        const data = { ...myFrame.toJSON() };
        state.do.set_loaded(true);
        state.child('frame')!.value = data;
      },
      listenForCommit(state: leafType) {
        dialogState.select(({ mode }) => {
          if (mode === 'save') {
            if (!state.value.loaded || state.value.saving) {
              return;
            }
            state.do.set_saving(true);
            state.do.saveFrame();
          }
        }, ({ closed }) => closed)
      },
      async saveFrame(state: leafType) {
          dataManager.do(async(db) => {
            const frameData = state.child('frame')!.value;
            await db.frames.incrementalUpsert(frameData);
          })
      },

      deleteFrame(state: leafType) {
        dataManager.deleteFrame(state.value.frame.id);
        dialogState.do.cancel();
      },

      init(state: leafType) {
        state.do.initData();
        state.do.listenForCommit();
      }
    }
  };
};

export default FrameDetailState;
