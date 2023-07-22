import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { Frame } from '~/types'
import dataManager from '~/lib/managers/dataManager'

export type MarkdownStateValue = { text: '',
  frame: Frame | null,
  loaded: false,
  styles: Map<string, string>,
  error: string | null };

type leafType = typedLeaf<MarkdownStateValue>;

const MarkdownState = (props: { frame: Frame }) => {
  const $value: MarkdownStateValue = {
    frame: null,
    text: '',
    loaded: false,
    error: null,
    styles: new Map()
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
      async loadStyles(state: leafType, db) {
        const styles = await db.styles
          .findByIds(['global', props.frame.id]).exec();
        styles.forEach((style, id) => styles.set(id, style.style))
        state.do.set_styles(styles);
      },
      async load(state: leafType) {
        const id = props.frame.id;
        const db = await dataManager.db();
        state.do.loadStyles(db); // not awaiting
        const map = await db.frames.findByIds([id]).exec();
        if (!state.value.loaded) {
          state.do.set_loaded(true);
        }
        if (map.has(id)) {
          const doc = map.get(id);
          try {
            state.do.set_frame(doc.toJSON());
          } catch (err) {
            console.error('error in markdown doc', err);
          }
        } else {
          console.error('bad id ', id, 'from frame', props.frame);
          state.do.set_error('cannot find id ' + id);
        }
      }
    }
  };
};

export default MarkdownState;
