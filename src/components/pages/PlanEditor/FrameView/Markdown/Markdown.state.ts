import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
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
    frame: props.frame,
    text: '',
    loaded: false,
    error: null,
    styles: ''
  };
  return {
    name: "Markdown",
    $value,

    selectors: {},

    actions: {
      async loadStyles(state: leafType) {
        return dataManager.do(async (db) => {
          const subject = db.style.find()
            .where('scope')
            .eq(frameId)
            .$;

          return subject.subscribe((styles) => {
            const styleText = styles.map(({ tag, style }) => {
              let selector = tag === '.markdown-frame' ? tag : `.markdown-frame ${tag}`;
              return `
              #frame-${frameId} ${selector} {
                ${style}
              }
              `
            }).join(`\n\n`);
            state.do.set_styles(styleText);
          });
        });
      },
      async init(state: leafType) {
        await state.do.loadStyles();
        state.do.set_loaded(true);
      }
    }
  };
};

export default MarkdownState;
