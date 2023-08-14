import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import blockManager from '~/lib/managers/blockManager'
import { Box2, Vector2 } from 'three'
import { userManager } from '~/lib/managers/userManager'
import messageManager from '~/lib/managers/messageManager'
import { Direction } from '~/components/pages/PlanEditor/managers/resizeManager.types'
import keyManager from '~/lib/managers/keyManager'

export enum planEditorMode {
  NONE = 'none',
  ADDING_FRAME = 'adding-frame',
  MOVING_FRAME = 'moving-frame',
  PANNING = 'panning'
}

export type PlanEditorStateValue = {
  loaded: boolean,
  keys: Set<string>,
  mode: planEditorMode,
  modeTarget: string | null;
  moveDir: Direction | null,
  newFrame: Box2 | null,
  frames: [],
  links: [],
  markdownStyles: string
};

type leafType = typedLeaf<PlanEditorStateValue>;

const PlanEditorState = (id, planContainerRef) => {
  const $value: PlanEditorStateValue = {
    frames: [],
    links: [],
    keys: new Set(),
    loaded: false,
    mode: planEditorMode.NONE,
    newFrame: null,
    moveDir: null,
    markdownStyles: '',
    modeTarget: null,
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
      async markdownStyleSub() {
        return dataManager.do(async (db) => {
          return db.style.find()
            .where('scope')
            .eq('global')
            .$;
        })
      },
      initContainer(state: leafType) {
        if (planContainerRef.current) {
          planContainerRef.current.addEventListener('contextmenu', (e) => {
            if (!e.shiftKey) {
              state.do.onMouseDown(e, true)
            }
          });
          planContainerRef.current.addEventListener('mousedown', state.do.onMouseDown);
        } else {
          setTimeout(state.$.initContainer, 100);
        }
      }
    },

    actions: {
      keys(state: leafType, keys: Set<string>) {
        state.do.set_keys(keys);
        console.log('keys: ', keys);
        if ((!blockManager.$.isBlocked()) && keys.has(' ')) {
          state.do.pan();
        }
      },

      pan(state: leafType) {
        console.log('---- panning');
        const observable = blockManager.do.block(planEditorMode.PANNING);

        const sub = observable.subscribe({
          next(value) {
            console.log(  'pan observed:', value)
          },
          error(_err) {
            console.error('pan error', _err);
            keySub.unsubscribe();
          },
          complete() {
            console.log('pan complete');
            keySub.unsubscribe();
          }
        });

        let keySub = keyManager.stream.subscribe((keys) => {
           if (!keys.has(' ')) {
             // @TODO: finish panning
             sub.unsubscribe()
           }
        });

        /**
         * TODO: observe mouse, pan POV
         */
      },

      async loadMarkdownStyles(state: leafType) {
        const subject = await state.$.markdownStyleSub();
        return subject.subscribe((styles) => {
          const styleString = styles.map(
            ({
               tag,
               style
             }) => `.markdown-frame ${tag === '.markdown-frame' ? '' : tag} { ${style} }`)
            .join("\n")
          state.do.set_markdownStyles(styleString);
        });
      },
      onMouseDown(state: leafType, e: MouseEvent, fromContextMenu = false) {
        e.preventDefault();
        e.stopPropagation();

        if (!e.shiftKey) {
          if (fromContextMenu || e.button === 2 || state.value.keys.has('f')) {
            state.do.onRightMouseDown(e);
          }
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
          if (frame.width >= 150 && frame.height >= 150) {
            dataManager.addFrame(id, frame);
          } else {
            messageManager.notify('New Frame',
              'frame is too small - no frame created Frame width and height must be at least 150 pixels');
          }
        }
      },

      moveFrame(state: leafType, id: string) {
        if (blockManager.$.isBlocked()) {
          return;
        }
        try {
          blockManager.do.block(planEditorMode.MOVING_FRAME, { frameId: id })[1]
            .subscribe({
              error(err) {
                console.error('error in blockSub:', err);
              },
              complete() {
                state.do.clearMode();
              }
            })
          state.do.initMode(planEditorMode.MOVING_FRAME, id);
          //@TODO: migrate 100% to blockManager
        } catch (_err) {
          console.warn('attempt to move frame when blocked', _err);
        }
      },

      initMode(state: leafType, mode: string, id: string) {
        state.do.set_modeTarget(id || null);
        state.do.set_mode(mode);
      },

      clearMode(state: leafType) {
        state.do.set_modeTarget(null);
        state.do.set_mode(planEditorMode.NONE);
      },
      /**
       * manage the drag event that creates a new frame
       */
      onRightMouseDown(state: leafType, e: MouseEvent) {
        if (blockManager.$.isBlocked()) {
          return;
        }
        try {
          const [_blockId, subject] = blockManager.do.block(planEditorMode.ADDING_FRAME);
          state.getMeta('rightDownSub')?.complete();
          state.setMeta('rightDownSub', subject, true);
        } catch (_err) {
          console.warn('right click while blocked');
          return;
        }
        let end = null;
        const start = new Vector2(e.x, e.y);

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
          state.getMeta('rightDownSub')?.complete();
          state.setMeta('rightHandSub', null, true)
          finish();
          state.do.createFrame(start, end);
        }, { once: true })
        state.do.initMode(planEditorMode.ADDING_FRAME)
      },

      async init(state: leafType) {
        state.$.initContainer();
        let sub;
        dataManager.initPlan(id)
          .then(() => {
            state.do.set_loaded(true);
            sub = dataManager.planStream.subscribe(({ plan, frames, links }) => {
              state.do.set_frames(frames);
              state.do.set_links(links);
            })
          })
          .catch(err => {
            console.error('cannot init project', id, err);
            userManager.getMeta('router')?.push('/');
          })
        state.do.loadMarkdownStyles();
        return sub;
      }
    }
  };
};

export default PlanEditorState;
