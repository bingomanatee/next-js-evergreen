import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import { FrameDetailProps } from '~/components/Dialogs/FrameDetail/types'
import { debounce } from 'lodash'

export type FrameDetailStateValue = {
  loaded: boolean;
  saving: boolean;
};
type leafType = typedLeaf<FrameDetailStateValue>;

export type ContentDetailStateValue = {
  type: string
};
type contentType = typedLeaf<ContentDetailStateValue>;

const FrameDetailState = (props: FrameDetailProps) => {
  const $value: FrameDetailStateValue = {
    loaded: false, saving: false
  };
  return {
    name: "FrameDetail",
    $value,

    selectors: {},

    children: {
      frame: {
        $value: {
          id: '',
          left: 0,
          top: 0,
          width: 0,
          height: 0,
        },
        children: {
          content: {
            $value: {
              type: 'markdown'
              // note - as this is a polymorphic field
              // we can't set default values beyond the type name
            },
            actions: {
              updateMarkdown(state: contentType, e: InputEvent) {
                //@ts-ignore
                const markdown = e.target.value;
                state.value = { ...state.value, markdown };
              }
            }
          }
        }
      }
    },

    actions: {
      updateStyle(state: leafType, id: string, value: string) {
        const styles = new Map(state.value.styles);
        styles.set(id, value);
        state.do.set_styles(styles);
      },
      updateStyles(state: leafType, styles?: Map<string, string>) {

        if (!state.getMeta('stylesDB')) {
          state.setMeta('stylesDB', debounce((styles: Map<string, string>) => {
            if (!styles) {
              styles = new Map(state.value.styles);
            }
            state.do.set_styles(styles);
          }));
        }

        state.getMeta('stylesDB')(styles)
      },
      async initData(state: leafType) {
        const db = await dataManager.db();
        const frame = await db.frames.findByIds([props.value.id]).exec();
        const myFrame = frame.get(props.value.id);
        const data = { ...myFrame.toJSON() };
        data.content = { ...data.content };
        state.do.set_loaded(true);
        state.child('frame')!.value = data;
      },
      listenForCommit(state: leafType) {
        props.dialogStream.subscribe((evt) => {
          if (evt.type === 'save') {
            if (!state.value.loaded) {
              return;
            }
            if (!state.value.saving) {
              state.do.set_saving(true);
              state.do.saveFrame();
            }
          }
        })
      },
      async saveFrame(state: leafType) {
        console.log('---- saveFrame started');
        try {
          const db = await dataManager.db();
          const frameData = state.child('frame')!.value;
          console.log('--- preserving frame ', frameData);
          await db.frames.incrementalUpsert(frameData);
          state.value.styles.forEach((style, id) => {
            console.log('--- preserving style', id, style);
            db.styles.incrementalUpsert({ id, style })
          })
        } catch (err) {
          console.error('load error:', err)
        }

      },
      load(state: leafType) {
        state.do.initData();
        state.do.listenForCommit();
      }
    }
  };
};

export default FrameDetailState;
