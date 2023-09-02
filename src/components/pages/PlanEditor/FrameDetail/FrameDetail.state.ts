import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import { Frame } from '~/types'
import searchFrames from '~/lib/utils/searchFrames'
import { sortBy } from 'lodash';
import blockManager from '~/lib/managers/blockManager'

export type FrameDetailStateValue = {
  loaded: boolean;
  saving: boolean;
  search: string;
  frames: Frame[];
  move: any;
};
type leafType = typedLeaf<FrameDetailStateValue>;

const FrameDetailState = (id: string) => {
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
        const { search, frames } = state.value;

        return sortBy(searchFrames(frames, search), 'order');
      }
    },

    actions: {
      reorder(state: leafType, order: string, frameId: string) {
        state.do.set_move({ order, frameId })
      },

      async initData(state: leafType) {
        const { data } = blockManager.value;
        const frame = dataManager.getFrame(data.frameId);
        if (!frame) {
          console.error('cannot get frame', data.frameId);
          blockManager.do.finish();
          return;
        }
        state.child('frame')!.value = {...frame};
        state.do.set_loaded(true);

        const sub = dataManager.planStream.subscribe(({ frames }) => {
          state.do.set_frames(frames);
        });

        return () => sub.unsubscribe()
      },
      async save(state: leafType) {
        console.log('saving frame');
        state.do.set_saving(true);
        await dataManager.do(async (db) => {
          const frameData = state.child('frame')!.value;
          const oldFrame = await dataManager.fetchFrame(frameData.id)
          console.log('saving frameData:', frameData, 'over', oldFrame);
          await db.frames.incrementalUpsert(frameData);
        });
        console.log('closing');
        blockManager.do.finish();
      },

      deleteFrame(state: leafType) {
        dataManager.deleteFrame(state.value.frame.id);
        state.do.cancel();
      },

      cancel() {
        blockManager.do.finish();
      },

      init(state: leafType) {
        state.do.initData();
      },
      updateSize(state: leafType, leafType, width, height) {
        state.child('frame')!.do.updateSize(width, height);
      }
    },

    children: {
      frame: {
        type: true,

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
