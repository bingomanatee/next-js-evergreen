import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import { Frame } from '~/types'
import searchFrames from '~/lib/utils/searchFrames'
import {sortBy} from 'lodash';

export type FrameDetailStateValue = {
  loaded: boolean;
  saving: boolean;
  search: string;
  frames: Frame[];
  move: any;
};
type leafType = typedLeaf<FrameDetailStateValue>;

const FrameDetailState = (id: string, dialogState: leafI) => {
  const $value: FrameDetailStateValue = {
    loaded: false,
    saving: false,
    search: '',
    frames: [],
    move: null,
  };
  return {
    name: "FrameDetail",
    $value,

    selectors: {
      afterChoices(state: leafType) {
        const {search, frames} = state.value;

        return sortBy(searchFrames(frames, search), 'order');
      }
    },

    actions: {
      reorder(state: leafType, order: string, frameId: string) {
        state.do.set_move({order, frameId})
      },

      async initData(state: leafType) {
        dataManager.do(async (db) => {
          const frame = await db.frames.findByIds([id]).exec();
          const myFrame = frame.get(id);
          const data = { ...myFrame.toJSON() };
          state.do.set_loaded(true);
          state.child('frame')!.value = data;
        });

      const sub = dataManager.planStream.subscribe(({frames}) => {
        state.do.set_frames(frames);
      });

      return () => sub.unsubscribe()
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
      },
      updateSize(state: leafType, leafType, width, height) {
        state.child('frame')!.do.updateSize(width, height);
      }
    },

    children: {
      frame: {
        $value: {
          id: '',
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          type: 'markdown',
          value: '',
        },

        actions: {
          updateSize(state: leafI, width, height) {
            if (width && typeof width === 'number' && width !== state.value.width) {
              state.do.set_width(width);
            }
            if (width && typeof height === 'number' && height !== state.value.height) {
              state.do.set_height(height);
            }
          }
        }
      }
    },
  };
};

export default FrameDetailState;
