import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { BlockMode, FrameTypes } from '~/types'
import { v4 } from 'uuid'
import dataManager from '~/lib/managers/dataManager'
import messageManager from '~/lib/managers/messageManager'
import blockManager from '~/lib/managers/blockManager'
import keyManager from '~/lib/managers/keyManager'
import { Vector2 } from 'three'
import swallowEvent from '~/lib/swallowEvent'

export type ControlBarStateValue = { panning: boolean, panPosition: Vector2 };

type leafType = typedLeaf<ControlBarStateValue>;

const ControlBarState = (props, planEditorState) => {
  const $value: ControlBarStateValue = {
    panning: false,
    panPosition: new Vector2(0, 0)
  };
  return {
    name: "ControlBar",
    $value,

    selectors: {
      alpha(state: leafType) {
      }
    },

    actions: {
      async addFrame(state: leafType, type: string) {
        const { newFrame } = state.value;
        const planId = dataManager.planStream.value.plan?.id;
        if (!planId) {
          return messageManager.notify('New Frame', 'Cannot identify plan', 'error');
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
          await db.frames.incrementalUpsert(newFrame);
          messageManager.notify('New Frame', `Created new ${type} ${id} `)
          blockManager.do.block(BlockMode.EDIT_FRAME, {frameId: id})
        })
      },
      init(state: leafType) {
      },
      onPanImage(state: leafType, img: HTMLImageElement) {
        if (!img) {
          return;
        }
        img.addEventListener('mousedown', (e) => {

          const { x, y } = e;
          const startPan = planEditorState.value.pan.clone();
          const start = new Vector2(x, y);
          const mover = (e: MouseEvent) => {
            const newPan = new Vector2(e.x, e.y).sub(start).round();
            state.do.set_panPosition(newPan);
            planEditorState.do.set_pan(newPan
              .multiplyScalar(100 / planEditorState.value.zoom)
              .add(startPan));
          }
          window.document.addEventListener('mousemove', mover);
          window.document.addEventListener('mouseup', () => {
            window.document.removeEventListener('mousemove', mover);
            state.do.set_panPosition(new Vector2());
          }, { once: true });
        });

      },
      endPan(state: leafI, e) {
        // only listen to clicks in the background
        blockManager.do.finishSlow();
        swallowEvent(e);
        window.removeEventListener('mousedown', state.do.endPan);
      },
      pan(state: leafType, e) {
        if (blockManager.value.type === BlockMode.PANNING) {
          state.do.endPan(e);
          return;
        }
        swallowEvent(e);

        if (blockManager.$.isBlocked()) {
          return;
        }

        window.removeEventListener('mousedown', state.do.endPan);
        window.document.addEventListener('mousedown', state.do.endPan, { once: true });

        state.do.set_panning(true);
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
