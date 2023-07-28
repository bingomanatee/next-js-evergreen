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
  keys: Set<string>,
  mode: planEditorMode,
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
    markdownStyles: '',
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
      async loadMarkdownStyles(state: leafType) {
        const subject = await state.$.markdownStyleSub();
        return subject.subscribe((styles) => {
          const styleString = styles.map(({ tag, style }) => `.markdown-frame ${tag === '.markdown-frame' ? '' : tag} { ${style} }`)
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
          dataManager.addFrame(id, frame);
        }
      },

      onRightMouseDown(state: leafType, e: MouseEvent) {
        if (blockManager.isBlocked) {
          return;
        }
        const subject = blockManager.block('');
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
          subject.complete();
          finish();
          state.do.createFrame(start, end);
        }, { once: true })
        state.setMeta('rightDownSub', subject);
        state.do.set_mode(planEditorMode.ADDING_FRAME)
      },
      async init(state: leafType) {
        state.$.initContainer();
        let sub;
        dataManager.initPlan(id)
          .then(() => {
            state.do.set_loaded(true);
            sub = dataManager.planStream.subscribe(({ plan, frames, links }) => {
              console.log('PlanEditor: updating frames with ', frames);
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
