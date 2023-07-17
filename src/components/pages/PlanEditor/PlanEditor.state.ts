import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import blockManager from '~/lib/managers/blockManager'
import { Box2, Vector2 } from 'three'
import { userManager } from '~/lib/managers/userManager'

const ADDING_FRAME = 'adding-frame';
const NONE = 'none';

enum planEditorMode {
  NONE,
  ADDING_FRAME
}

export type PlanEditorStateValue = {
  loaded: boolean,
  mode: planEditorMode,
  newFrame: Box2 | null,
  frames: [],
  links: []
};

type leafType = typedLeaf<PlanEditorStateValue>;

const PlanEditorState = (id, planContainerRef) => {
  const $value: PlanEditorStateValue = {
    frames: [],
    links: [],
    loaded: false,
    mode: planEditorMode.NONE,
    newFrame: null
  };
  return {
    name: "PlanEditor",
    $value,

    selectors: {
      offsetBox(state: leafType, start: Vector2, end: Vector2) {
        const box = new Box2(start.clone(), end.clone())
        const rect = planContainerRef.current.getBoundingClientRect();
        const offset = new Vector2(rect.x, rect.y).multiplyScalar(-1);
        box.translate(offset)
        return box;
      },
      initContainer(state: leafType) {
        if (planContainerRef.current) {
          planContainerRef.current.addEventListener('contextmenu', (e) => {

            state.do.onMouseDown(e, true)
          });
          planContainerRef.current.addEventListener('mousedown', state.do.onMouseDown);
        } else {
          setTimeout(state.$.initContainer, 100);
        }
      }
    },

    actions: {
      onMouseDown(state: leafType, e: MouseEvent, fromContextMenu = false) {
        console.log('state intercepted mouse event: ', e);
        e.preventDefault();
        e.stopPropagation();

        if (fromContextMenu || e.button === 2) {
          state.do.onRightMouseDown(e);
        }
      },

      drawPendingFrame(state: leafType, start: Vector2, end: Vector2) {
        console.log('drawPendingFrame: ', start.toArray(), end.toArray());
        if (start && end) {
          state.do.set_newFrame(state.$.offsetBox(start, end));
        }
      },

      createFrame(state: leafType, start: Vector2, end: Vector2) {
        if (start && end) {
          const frame = state.$.offsetBox(start, end);
          dataManager.addFrame(id, frame);
        }
      },

      onRightMouseDown(state: leafType, e: MouseEvent) {
        if (blockManager.isBlocked) {
          console.log('blocked to create new frame');
          return;
        }
        const subject = blockManager.block('');
        let end = null;
        const start = new Vector2(e.x, e.y);
        console.log('----- start is ', start.toArray());
        const onMove = (e: MouseEvent) => {
          end = new Vector2(e.x, e.y);
          state.do.drawPendingFrame(start, end);
        };

        const finish = () => {
          planContainerRef.current.removeEventListener('mousemove', onMove);
          state.do.set_newFrame(null);
        }
        planContainerRef.current?.addEventListener('mousemove', onMove);
        planContainerRef.current?.addEventListener('mouseup', () => {
          subject.complete();
          finish();
          state.do.createFrame(start, end);
        }, { once: true })
        state.setMeta('rightDownSub', subject);
        state.do.set_mode(planEditorMode.ADDING_FRAME)
      },
      async load(state: leafType) {
        state.$.initContainer();
        let sub;
        dataManager.initPlan(id)
          .then(() => {
            state.do.set_loaded(true);
           sub = dataManager.planStream.subscribe(({plan, frames, links}) => {
              state.do.set_frames(frames);
              state.do.set_links(links);
            })
          })
          .catch(err => {
            console.error('cannot init project', id, err);
            userManager.getMeta('router')?.push('/');
          })

        return sub;
      }
    }
  };
};

export default PlanEditorState;
