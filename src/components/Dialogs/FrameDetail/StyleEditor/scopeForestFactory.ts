import { leafConfig, leafI } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import { leafType } from '~/components/Dialogs/FrameDetail/StyleEditor/types'

export function scopeForestFactory(scope: string, dialogState: leafI): leafConfig {
  try {
    return {
      $value: new Map(),
      name: scope,
      actions: {
        init(state: leafI) {
          return dataManager.do(async (db) => {
            const styles = await db.style.find()
              .where('scope')
              .eq(scope)
              .exec();

            state.do.addStyles(styles);
            state.do.listenForCommit();
          });
        },
        delete(state: leafType, tagName: string) {
          const value = new Map(state.value);
          value.delete(tagName);
          // @TODO: delay deletion of store
          dataManager.deleteState(scope, tagName)
          state.value = value;
        },
        listenForCommit(state: leafType) {
          console.log('---- listening to save style scope ', scope);
          dialogState.select((event) => {
            console.log('dialog event (in scope)', event);
              if (event.mode === 'save') {
                if (state.getMeta('loaded') && !state.getMeta('saving')) {
                  state.do.save();
                }
              }
            }
            , ({ closed }) => closed)
        },
        addStyles(state: leafI, styles: any[]) {
          const value = new Map(state.value);
          styles.forEach((styleDoc) => {
            value.set(styleDoc.tag, styleDoc.style);
          });
          state.value = value;
          state.setMeta('loaded', true, true);
        },
        save(state: leafI) {
          state.setMeta('saving', true, true);
          // @TODO: delete existing keys that are not in the state
          dataManager.do(async (db) => {
            state.value.forEach((style, tag) => {
              console.log('--- saving ', scope, style, tag);
              db.style.incrementalUpsert({
                scope, style, tag
              });
            });
          });
        }
      }
    };
  } catch (err) {
    return { $value: null };
  }
}
