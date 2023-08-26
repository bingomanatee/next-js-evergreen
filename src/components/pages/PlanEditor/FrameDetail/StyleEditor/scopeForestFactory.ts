import { leafConfig, leafI } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import { leafType } from '~/components/pages/PlanEditor/FrameDetail/StyleEditor/types'

export function scopeForestFactory(scope: string, frameDetailState): leafConfig {
  try {
    return {
      $value: new Map(),
      name: scope,
      actions: {
        init(state: leafI) {
          dataManager.do(async (db) => {
            const styles = await db.style.find()
              .where('scope')
              .eq(scope)
              .exec();

            state.do.addStyles(styles);

          });
          const sub = frameDetailState.select((saving) => {
              if (saving) {
                state.do.save();
                sub.unsubscribe();
              }
            },
            (value) => value.saving);
          return () => sub?.unsubscribe();
        },
        delete(state: leafType, tagName: string) {
          const value = new Map(state.value);
          value.delete(tagName);
          // @TODO: delay deletion of store
          dataManager.deleteState(scope, tagName)
          state.value = value;
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
