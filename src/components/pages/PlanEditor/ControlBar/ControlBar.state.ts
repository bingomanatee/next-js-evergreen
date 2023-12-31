import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { BlockMode, FrameTypes } from '~/types'
import { v4 } from 'uuid'
import dataManager from '~/lib/managers/dataManager'
import messageManager from '~/lib/managers/messageManager'
import blockManager from '~/lib/managers/blockManager'
import keyManager from '~/lib/managers/keyManager'
import { Vector2 } from 'three'
import swallowEvent from '~/lib/swallowEvent'
import {userManager} from "~/lib/managers/userManager";
import frameListHoverManager from "~/lib/managers/frameListHoverManager";

export type ControlBarStateValue = { panPosition: Vector2 };

type leafType = typedLeaf<ControlBarStateValue>;

const ControlBarState = (props, planEditorState) => {
  const $value: ControlBarStateValue = {
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
        const userId = userManager.$.currentUserId();
        if (!planId) {
          return messageManager.notify('New Frame', 'Cannot identify plan', 'error');
        }
        if (!userId) {
          return messageManager.notify('New Frame', 'Cannot identify current user', 'error');
        }

        const id = v4();
        dataManager.do(async (db) => {
          const order = await db.frames.nextFrameOrder(planId);
          const created = new Date().toISOString();
          const newFrame = {
            id,
            plan_id: planId,
            user_id: userId,
            top: 100 + (Math.floor(Math.random() * 6) * 10),
            left: 100 + (Math.floor(Math.random() * 6) * 10),
            width: 300,
            height: 400,
            created,
            updated: created,
            updated_from: created,
            is_deleted: false,
            linkMode: 'center',
            type,
            order
          }
          await db.frames.incrementalUpsert(newFrame);
          messageManager.notify('New Frame', `Created new ${type} ${id} `)
          setTimeout(() => {
            frameListHoverManager.do.set_clicked(id);
            blockManager.do.block(BlockMode.EDIT_FRAME, {frameId: id})
          }, 100)
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
        blockManager.do.block(BlockMode.PANNING);
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
