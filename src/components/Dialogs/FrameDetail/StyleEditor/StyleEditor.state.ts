import { c } from '@wonderlandlabs/collect'
import { scopeForestFactory } from '~/components/Dialogs/FrameDetail/StyleEditor/scopeForestFactory'
import { leafType } from '~/components/Dialogs/FrameDetail/StyleEditor/types'

export type StyleEditorStateValue = {
  tagName: string, id: string,
}

/**
 * The styles are organized by scopes;
 * there should be (up to) two scopes - one global scope for all the frames
 * and one
 */
const StyleEditorState = (props, dialogState) => {
  const { id } = props
  const $value: StyleEditorStateValue = { tagName: 'p', id: id };

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
        state.do.addStyle(id);
      },
      addStyle(state: leafType, scope) {
        const tagName: string = state.value.tagName;
        console.log('add style scope', scope, tagName);
        if (!tagName) {
          return;
        }
        state.do.upsertScope(scope);
        state.child(scope)?.set(tagName, 'prop: value;');
      },
      upsertScope(state: leafType, scope: string) {
        if (!state.child(scope)) {
          const def = scopeForestFactory(scope, dialogState)
          state.addChild(def, scope);
          return state.child(scope)!.do.load();
        }
      },
      async save(state: leafType) {
        console.log('----- styleEditor - save');
        const children = state.children;
        for (const { child } of children) {
         await child.do.save();
        }
      },
      async load(state: leafType) {
        await state.do.upsertScope(id);
        await state.do.upsertScope('global');
      },
      async delete(state: leafType, tag, scope) {
        if (scope === 'local') {
         return state.child(id)!.do.delete(tag);
        } else {
         return state.child(scope)!.do.delete(tag);
        }
      }
    }
  };
};

export default StyleEditorState;
