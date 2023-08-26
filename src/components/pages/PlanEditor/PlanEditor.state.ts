import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import blockManager from '~/lib/managers/blockManager'
import { Box2, Vector2 } from 'three'
import { userManager } from '~/lib/managers/userManager'
import messageManager from '~/lib/managers/messageManager'
import keyManager from '~/lib/managers/keyManager'
import { Direction } from '~/types'
import { scale } from '@chakra-ui/tooltip/dist/tooltip.transition'

export enum planEditorMode {
  NONE = 'none',
  ADDING_FRAME = 'adding-frame',
  MOVING_FRAME = 'moving-frame',
  LINKING_FRAME = 'linking-frame',
  EDIT_FRAME = 'edit-frame',
  PANNING = 'panning'
}

export type PlanEditorStateValue = {
  planId: string,
  loaded: boolean,
  keys: Set<string>,
  mode: planEditorMode,
  modeTarget: string | null;
  moveDir: Direction | null,
  newFrame: Box2 | null,
  frames: [],
  links: [],
  pan: Vector2,
  markdownStyles: string,
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
    planId: id,
    pan : new Vector2(),
    zoom: 100
  };
  return {
    name: "PlanEditor",
    $value,

    selectors: {
      offsetBox(state: leafType, start: Vector2, end: Vector2): Box2 {
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
              e.preventDefault();
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
      clearTransform(state: leafType) {
        state.do.set_zoom(100);
        state.do.set_pan(new Vector2());
      },
      keys(state: leafType, keys: Set<string>) {
        state.do.set_keys(keys);
        if ((!blockManager.$.isBlocked()) && keys.has(' ')) {
          state.do.pan();
        }
      },

      pan(state: leafType) {
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
        if (blockManager.$.isBlocked()) {
          return;
        }
        if (e.target?.dataset['role'] !== 'plan-editor-main') {
          console.warn('bad target:', e.target?.dataset);
          return;
        }
        ;
        e.preventDefault();
        e.stopPropagation();

        if (!e.shiftKey) {
          if (fromContextMenu || e.button === 2 || state.value.keys.has('f')) {

            state.do.onRightMouseDown(e);
          }
        }
      },

      drawPendingFrame(state: leafType, start: Vector2, end: Vector2) {
        if (start && end) {
          state.do.set_newFrame(state.$.offsetBox(start, end));
        }
      },

      createFrame(state: leafType, start: Vector2, end: Vector2) {
        if (start && end) {
          const frame = state.$.offsetBox(start, end); //@TODO: handle reverse drags
          const size = frame.getSize(new Vector2());
          if (size.x >= 150 && size.y >= 150) {
            dataManager.addFrame(id, frame);
          } else {
            blockManager.do.finish();
            messageManager.notify('New Frame',
              'frame is too small - no frame created Frame width and height must be at least 150 pixels');
          }
        }
      },

      async linkFrame(state: leafType, id: string) {

        try {
          keyManager.init();
          let keySub = keyManager.stream.subscribe((keys) => {
            if (keys.has('Escape')) {
              blockManager.do.finish();
              keySub.unsubscribe();
            }
          });
          blockManager.do.block(planEditorMode.LINKING_FRAME, { frameId: id })[1]
            .subscribe({
              error(err) {
                keySub.unsubscribe();
                console.error('error in blockSub:', err);
              },
              complete() {
                keySub.unsubscribe();
                state.do.clearMode();
              }
            })
          state.do.initMode(planEditorMode.LINKING_FRAME, id);
          //@TODO: migrate 100% to blockManager
        } catch (_err) {
          console.warn('attempt to move frame when blocked', _err);
        }
      },

      async moveFrame(state: leafType, id: string) {
        if (blockManager.$.isBlocked()) {
          return;
        }

        const frame = await dataManager.do((db) => {
          return db.frames.fetch(id);
        })

        if (!frame) {
          messageManager.notify(
            'Resize Frame',
            'frame data cannot be found for id ' + id
          );
          return;
        }

        if (frame.type === 'image') {
          messageManager.notify(
            'Resize Frame',
            'You cannot resize image frames; You CAN move the frame.',
            'warning'
          );
        }

        try {
          keyManager.init();
          let keySub = keyManager.stream.subscribe((keys) => {
            if (keys.has('Escape')) {
              blockManager.do.finish();
              keySub.unsubscribe();
            }
          });
          blockManager.do.block(planEditorMode.MOVING_FRAME, { frameId: id })[1]
            .subscribe({
              error(err) {
                keySub.unsubscribe();
                console.error('error in blockSub:', err);
              },
              complete() {
                keySub.unsubscribe();
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
          console.warn('not right mousing - blocked');
          return;
        }
        e.stopPropagation();
        e.preventDefault();
        console.log('target:', e.target);

        keyManager.init();
        let keySub = keyManager.stream.subscribe((keys) => {
          if (keys.has('Escape')) {
            blockManager.do.finish();
          }
        });

        let sub = blockManager.subscribe((value) => {
          if (value.type !== planEditorMode.ADDING_FRAME) {
            sub.unsubscribe();
            keySub.unsubscribe();
            planContainerRef.current?.removeEventListener('mousemove', onMove);
            state.do.set_newFrame(null);
          }
        });

        try {
          blockManager.do.block(planEditorMode.ADDING_FRAME);
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

        planContainerRef.current?.addEventListener('mousemove', onMove);
        planContainerRef.current?.addEventListener('mouseup', () => {
          if (blockManager.value.type === planEditorMode.ADDING_FRAME) {
            state.do.createFrame(start, end);
          }
          blockManager.do.finish();
        }, { once: true })
        state.do.initMode(planEditorMode.ADDING_FRAME) //deprecate
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

        state.do.watchWheel();
        return sub;
      },

      zoomOut(state: leafType) {
        const {zoom} = state.value;
        const nextZoom = Math.floor(zoom/10) + 1;
        state.do.set_zoom(nextZoom * 10);
      },
      zoomIn(state: leafType) {
        const {zoom} = state.value;
        const nextZoom = Math.floor(zoom/10) - 1;
        state.do.set_zoom(nextZoom * 10);
      },
      zoom(state: leafType, event) {
        let { zoom } = state.value;
        zoom += event.deltaY * -0.1;
        // Restrict scale
        state.do.set_zoom(Math.round(Math.min(Math.max(12.5, zoom), 400)))
      },
      watchWheel(state) {
        window.addEventListener('wheel', state.do.zoom);
      }
    }
  }
};

export default PlanEditorState;
