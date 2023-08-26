import { c } from '@wonderlandlabs/collect'
import { scopeForestFactory } from '~/components/pages/PlanEditor/FrameDetail/StyleEditor/scopeForestFactory'
import { leafType } from '~/components/pages/PlanEditor/FrameDetail/StyleEditor/types'
import { StyleEditorProps } from '~/components/pages/PlanEditor/FrameDetail/StyleEditor/StyleEditor'
import { leafI } from '@wonderlandlabs/forest/lib/types'

export type StyleEditorStateValue = {
  tagName: string, id: string,
}

/**
 * The styles are organized by scopes;
 * there should be (up to) two scopes - one global scope for all the frames
 * and one
 */
const StyleEditorState = (props: StyleEditorProps) => {
  const $value: StyleEditorStateValue = { tagName: 'p', id: props.id };

  return {
    name: "StyleEditor",
    $value,

    selectors: {
      /**
       * returns the values organized as styleName > scope > def, as an array of [styleName, Map] items
       * @param state
       */
      invert(state: leafType) {
        const styleDefs = c(new Map());
        c(state.children).forEach(({ child, key: scope }) => {
          c(child.value).forEach((styleDef, styleId) => {
            if (styleDefs.hasKey(styleId)) {
              styleDefs.get(styleId).set(scope, styleDef);
            } else {
              styleDefs.set(styleId, new Map([[scope, styleDef]]))
            }
          });
        });
        return Array.from(styleDefs.value.entries());
      }
    },

    actions: {
      addGlobalStyle(state: leafType) {
        state.do.addStyle('global');
      },
      addLocalStyle(state: leafType) {
        state.do.addStyle(props.id);
      },
      addStyle(state: leafType, scope) {
        const tagName: string = state.value.tagName;
        if (!tagName) {
          return;
        }
        state.do.upsertScope(scope);
        state.child(scope)?.set(tagName, 'prop: value;');
      },
      upsertScope(state: leafType, scope: string) {
        if (!state.child(scope)) {
          const def = scopeForestFactory(scope)
          state.addChild(def, scope);
          return state.child(scope)!.do.init();
        }
      },
      async save(state: leafType) {
        const children = state.children;
        for (const { child } of children) {
         await child.do.save();
        }
      },
      init(state: leafType, frameState: leafI) {
        state.do.upsertScope(props.id);
        state.do.upsertScope('global');
        const sub = frameState.select((saving) => {
          if (saving) {
            state.do.save();
            sub.unsubscribe();
          }
        }, (value) => value.saving)


          return () => sub?.unsubscribe();
      },
      async delete(state: leafType, tag, scope) {
        if (scope === 'local') {
         return state.child(props.id)!.do.delete(tag);
        } else {
         return state.child(scope)!.do.delete(tag);
        }
      }
    }
  };
};

export default StyleEditorState;
