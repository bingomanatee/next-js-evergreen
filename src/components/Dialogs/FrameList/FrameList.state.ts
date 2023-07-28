import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import { Frame, Link } from '~/types'
import { throttle } from 'lodash'
import { Vector2 } from 'three'
import px from '~/lib/utils/px'
import sortByOrder from '~/lib/utils/SortByOrder'
import messageManager from '~/lib/managers/messageManager'

export type FrameListStateValue = { frames: Frame[], links: Link[], mousePos: Vector2, overId: string | null, clickedId: string | null };

type leafType = typedLeaf<FrameListStateValue>;
const THROTTLED = 'mouseMoveThrottled';

function describeFramesIter(f) {
  return `${f.id} - ${f.order}`
}

const FrameListState = (props, gridRef, bodyRef) => {
  const $value: FrameListStateValue = { overId: null, frames: [], links: [], mousePos: new Vector2(), clickedId: null };
  return {
    name: "FrameList",
    $value,

    selectors: {
      flyoverStyle(state: leafType) {
        const { mousePos, clickedId } = state.value;
        if (!clickedId) {
          return { display: 'none' };
        }
        return { left: px(mousePos.x + 2), top: px(mousePos.y + 2) }
      }
    },

    actions: {
      gridMouseDown(state: leafType, e: MouseEvent) {
        e.stopPropagation();
        //@ts-ignore
        const id = e.target.dataset.id;
        if (id === 'header') {
          return;
        }
        console.log('grid mouse down', id);
        state.do.set_clickedId(id);
        const moveListener = (e) => state.do.mouseMove(e);

        const moveUnListener = () => {
          gridRef.current?.removeEventListener('mousemove', moveListener);
          bodyRef.current?.removeEventListener('mousemove', moveListener);
          const { clickedId, overId } = state.value
          if (clickedId && overId && overId !== clickedId) {
            state.do.moveFrame(clickedId, overId);
          }
          state.do.set_clickedId(null);
        };
        bodyRef.current?.addEventListener('mousemove', moveListener);
        bodyRef.current?.addEventListener('mouseup', moveUnListener, { once: true });
        bodyRef.current?.addEventListener('mouseleave', moveUnListener, { once: true });
      },
      editFrame(state: leafType, id: string, e: MouseEvent) {
        e.stopPropagation()
        console.log('edit frame', id, props);
        props.cancel();
        console.log('ended list');
        setTimeout(async () => {
          const m = await dataManager.do((db) => db.frames.findByIds([id]).exec());
          messageManager.editFrame(id, m.get(id)?.name)
        }, 500)
      },
      async moveFrame(state: leafType, fromId: string, toId: string) {
        console.log('moving frame ', fromId, 'to after', toId);
        const { frames } = state.value;
        const orderedFrames = frames.sort(sortByOrder)
        const frameFrom = frames.find((frame) => frame.id === fromId);
        if (!frameFrom) {
          console.error('cannot find ', fromId);
          return
        }
        ;
        console.log('frame order from', frames.map(describeFramesIter));


        const reorderedFrames: Frame[] = orderedFrames.map((frame) => {
          if (frame.id === fromId) {
            return [];
          }
          if (frame.id === toId) {
            return [frame, frameFrom];
          }
          return frame;
        }).flat().filter((n) => !!n);
        console.log('... to', reorderedFrames.map(describeFramesIter));
        const ids = [];
        const byId = reorderedFrames.reduce((memo, frame, index) => {
          frame.order = index + 1;
          memo.set(frame.id, frame);
          ids.push(frame.id);
          return memo;
        }, new Map());

        const existingFrames = await dataManager.do(async (db) => {
          return db.frames.findByIds(ids).exec();
        });
        byId.forEach((frame: Frame, id: string) => {
          if (existingFrames.has(id)) {
            const existingFrame = existingFrames.get(id);
            if (existingFrame.order !== frame.order) {
              existingFrame.incrementalPatch({ order: frame.order })
            }
          } else {
            console.warn('cannot reorder id ', id, 'not in ', existingFrames);
          }
        })
      },
      mouseEnter(state: leafType, id) {
        if (state.value.clickedId) {
          state.do.set_overId(id);
        }
      },

      mouseLeave(state: leafType) {
        if (state.value.overId) {
          state.do.set_overId(null);
        }
      },

      mouseMove(state: leafType, e: MouseEvent) {
        try {
          if (!(state.getMeta(THROTTLED))) {
            state.setMeta(THROTTLED, throttle((e) => state.do.mouseMoveInner(e), 150));
          }
          state.getMeta(THROTTLED)(e);
        } catch (err) {
          console.error('mousemove error:', err, state, e);
        }
      },
      mouseMoveInner(state: leafType, e: MouseEvent) {
        const pos = new Vector2(e.clientX, e.clientY);
        const bounds = bodyRef.current?.parentElement?.getBoundingClientRect();
        if (bounds) {
          const boundsPos = new Vector2(bounds.left, bounds.top);
          pos.sub(boundsPos);
          state.do.set_mousePos(pos);
        } else {
          console.log('no parent for ', bodyRef.current, '==', bodyRef.current.parentElement)
        }
      },
      init(state: leafType) {
        const sub = dataManager.planStream.subscribe(({ plan, frames, links }) => {
          state.do.set_frames(frames);
          state.do.set_links(links);
        });

        return () => sub?.unsubscribe();
      }
    }
  };
};

export default FrameListState;
