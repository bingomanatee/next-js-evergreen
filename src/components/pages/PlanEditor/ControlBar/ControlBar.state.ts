import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { FrameTypes } from '~/types'
import { v4 } from 'uuid'
import dataManager from '~/lib/managers/dataManager'
import messageManager from '~/lib/managers/messageManager'

export type ControlBarStateValue = {};

type leafType = typedLeaf<ControlBarStateValue>;

const ControlBarState = (props) => {
  const $value: ControlBarStateValue = {};
  return {
    name: "ControlBar",
    $value,

    selectors: {
      alpha(state: leafType) {
      }
    },

    actions: {
      async addFrame(state: leafType) {
        const {newFrame} = state.value;
        const planId = dataManager.planStream.value.plan?.id;
        console.log('new frame with newFrame', newFrame, 'plan id', planId);
        if (!planId) {
          return messageManager.notify('New Frame', 'Cannot identify plan', 'error');
        }
        const type =  newFrame.type || FrameTypes.unknown;

        if (type === FrameTypes.unknown) {
          return messageManager.notify('New Frame', 'Select a frame type first', 'error');
        }

        const id = v4();
        dataManager.do(async (db) => {
          const order = await db.frames.nextFrameOrder(planId);
          const newFrame = {
            id,
            plan_id: planId,
            top: 100 + (Math.floor(Math.random() * 6) * 10),
            left: 100 + (Math.floor(Math.random() * 6) * 10),
            width: 300,
            height: 400,
            created: Date.now(),
            linkMode: 'center',
            type,
            order
          }
          console.log('adding frame', newFrame);
          await db.frames.incrementalUpsert(newFrame);
          messageManager.notify('New Frame', `Created new ${type} ${id} `)
          messageManager.editFrame(id);
        })
      },
      init(state: leafType) {
      }
    },

    children: {
      newFrame: {
        $value: {
          type: FrameTypes.unknown,
          width: 150,
          height: 150
        }
      }
    }
  };
};

export default ControlBarState;
