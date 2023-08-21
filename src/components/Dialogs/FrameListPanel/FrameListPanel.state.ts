import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import { Frame, LFSummary, Link, X_DIR, Y_DIR } from '~/types'
import { throttle } from 'lodash'
import { Vector2 } from 'three'

// local
import sortByOrder from '~/lib/utils/SortByOrder'
import messageManager from '~/lib/managers/messageManager'

// component
import { FrameListProps } from './types'
import frameListHoverManager from '~/lib/managers/frameListHoverManager'

export type FrameListStateValue = {
  frames: Frame[],
  links: Link[],
  mousePos: Vector2,
  overId: string | null,
  activeId: string
  clickedId: string | null,
  search: string,
  offset: 0,
  linkTarget: string | null
};
type leafType = typedLeaf<FrameListStateValue>;
const THROTTLED = 'mouseMoveThrottled';

function describeFramesIter(f) {
  return `${f.id} - ${f.order}`
}

export const MAX_FRAMES = 30;

const FrameListPanelState = (props: FrameListProps, gridRef, bodyRef) => {
  const value: { id?: string } = props.value.value;

  const $value: FrameListStateValue = {
    overId: null,
    frames: [],
    links: [],
    linkTarget: null,
    mousePos: new Vector2(),
    activeId: value.id ?? '',
    clickedId: null,
    offset: 0,
    search: '',
  };
  return {
    name: "FrameList",
    $value,

    selectors: {
      links(state: leafType, id: string) {
        const { links } = state.value;

        return links.filter((link: Link) => link.start_frame === id || link.end_frame === id).length;
      },
      targetLinks(state: leafType) {
        const { links, linkTarget } = state.value;
        if (!linkTarget) {
          return new Map();
        }
        return links.reduce((memo, link: Link) => {
          if (link.start_frame === linkTarget) {
            memo.set(link.end_frame, link);
          }
          if (link.end_frame === linkTarget) {
            memo.set(link.start_frame, link);
          }
          return memo;
        }, new Map());
      },
      count(state: leafType, index: number) {
        const { offset } = state.value;

        return index + (offset * MAX_FRAMES) + 1;
      },
      population(state: leafType) {
        const { frames, search, linkTarget } = state.value;
        let frameSet = frames.sort(sortByOrder).reverse();
        if (search || linkTarget) {
          const linkedTo = state.$.targetLinks();
          const searchStr = search.toLowerCase();
          return frameSet.filter((frame: Frame) => {
            const { name, content, id } = frame;
            if (linkTarget === id) {
              return false;
            }

            if (linkedTo.has(id)) {
              return true;
            }
            if (search) {
              return [name, content, id].some((text) => `${text}`.toLowerCase().includes(searchStr));
            }

            return true;
          });
        }
        return frameSet
      },
      framesList(state: leafType) {
        const { offset } = state.value;
        return state.$.population().slice(offset * MAX_FRAMES, (offset + 1) * MAX_FRAMES);
      },
      atEnd(state: leafType) {
        const { offset } = state.value;
        return state.$.population().length <= (offset + 1) * MAX_FRAMES;
      },
      atStart(state: leafType) {
        const { offset } = state.value;
        return offset === 0;
      }
    },

    actions: {
      clearSearch(state: leafType) {
        state.do.set_search('');
      },
      addLink(state: leafType, id: string) {
        const { linkTarget, frames } = state.value;
        if (!(linkTarget && id && id !== linkTarget)) {
          return;
        }
        const config: LFSummary = {
          id: linkTarget,
          targetId: id,
          spriteDir: { x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_M },
          targetSpriteDir: { x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_M },
        };

        const baseFrame = frames.find(fr => fr.id === id);

        dataManager.do((db) => {
          return db.links.addLink(baseFrame.plan_id, config);
        })
      },
      next(state: leafType) {
        const { offset } = state.value;
        if (state.$.atEnd()) {
          return;
        }
        state.do.set_offset(offset + 1);
      },
      prev(state: leafType) {
        const { offset } = state.value;
        if (state.$.atStart()) {
          return;
        }
        state.do.set_offset(offset - 1);
      },
      gridMouseDown(state: leafType, e: MouseEvent) {
        e.stopPropagation();
        //@ts-ignore
        const id = e.target.dataset.id;
        if (id === 'header') {
          return;
        }
        state.do.set_clickedId(id);
        const moveListener = (e) => state.do.mouseMove(e);

        const moveUnListener = () => {
          gridRef.current?.removeEventListener('mousemove', moveListener);
          bodyRef.current?.removeEventListener('mousemove', moveListener);
          const { clickedId, overId } = state.value
          if (clickedId && overId && overId !== clickedId) {
            state.do.moveFrame(clickedId, overId);
          }
        };
        bodyRef.current?.addEventListener('mousemove', moveListener);
        bodyRef.current?.addEventListener('mouseup', moveUnListener, { once: true });
        bodyRef.current?.addEventListener('mouseleave', moveUnListener, { once: true });
      },
      editFrame(state: leafType, id: string, e: MouseEvent) {
        e.stopPropagation();
        props.cancel();
        frameListHoverManager.do.clear();

        setTimeout(async () => {
          messageManager.editFrame(id)
        }, 500)
      },
      async moveFrame(state: leafType, fromId: string, toId: string) {
        const { frames } = state.value;
        const orderedFrames = frames.sort(sortByOrder)
        const frameFrom = frames.find((frame) => frame.id === fromId);
        if (!frameFrom) {
          console.error('cannot find ', fromId);
          return
        }

        const reorderedFrames: Frame[] = orderedFrames.map((frame) => {
          if (frame.id === fromId) {
            return [];
          }
          if (frame.id === toId) {
            return [frame, frameFrom];
          }
          return frame;
        }).flat().filter((n) => !!n);
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
        frameListHoverManager.do.set_hover(id);
      },

      mouseLeave(state: leafType) {
        frameListHoverManager.do.set_hover(null);
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
          console.warn('no parent for ', bodyRef.current, '==', bodyRef.current.parentElement)
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

export default FrameListPanelState;
