import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { Frame } from '~/types'
import dataManager from '~/lib/managers/dataManager'

export type MarkdownStateValue = {
  text: '',
  frame: Frame | null,
  loaded: false,
  styles: string
  error: string | null
};

type leafType = typedLeaf<MarkdownStateValue>;

const MarkdownState = (props: { frame: Frame }) => {
  const frameId = props.frame.id;

  const $value: MarkdownStateValue = {
    frame: null,
    text: '',
    loaded: false,
    error: null,
    styles: ''
  };
  const id = props.frame.id;
  return {
    name: "Markdown",
    $value,

    selectors: {
      text(state: leafType) {
        return (state.value.frame.content?.markdown) ?? '_-- no content --_';
      },
      style(state: leafType) {
        return '';
      }
    },

    actions: {
      async loadStyles(state: leafType) {
        await dataManager.do(async (db) => {
          const styles = await db.style.find()
            .where('scope')
            .eq(frameId)
            .exec();

          const styleText = styles.map(({ tag, style }) => {
            return `
              #frame-${frameId} ${tag} {
                ${style}
              }
              `
          }).join(`\n\n`);
          state.do.set_styles(styleText);
        });
      },
      async load(state: leafType) {
        state.do.loadStyles();
        await dataManager.do(async (db) => {
          const map = await db.frames.findByIds([frameId]).exec();
          if (!state.value.loaded) {
            state.do.set_loaded(true);
          }
          if (map.has(frameId)) {
            const doc = map.get(frameId);
            try {
              state.do.set_frame(doc.toJSON());
            } catch (err) {
              console.error('error in markdown doc', err);
            }
          } else {
            console.error('bad id ', frameId, 'from frame', props.frame);
            state.do.set_error('cannot find id ' + frameId);
          }
        });

      }
    }
  };
};

export default MarkdownState;
