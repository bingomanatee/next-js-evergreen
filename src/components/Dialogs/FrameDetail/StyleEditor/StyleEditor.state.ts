import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { c } from '@wonderlandlabs/collect'
import dataManager from '~/lib/managers/dataManager'

export type StyleEditorStateValue = {
  tagName: string, id: string
}

type leafType = typedLeaf<StyleEditorStateValue>;

function scopeState(scope: string) {
  try {
    let $value = new Map();

    return {
      $value: new Map(),
      name: scope,
      actions: {
        load(state: leafI) {
         return dataManager.do(async (db) => {
            const styles = await db.style.find()
              .where('scope')
              .eq(scope)
              .exec();

            console.log('--- loaded scope', scope, 'styles = ', styles);
            state.do.addStyles(styles);
          });
        },

        addStyles(state: leafI, styles: any[]) {
          const value = new Map(state.value);
          styles.forEach((styleDoc) => {
            value.set(styleDoc.tag, styleDoc.style);
          });
          state.value = value;
        },
        save(state: leafI) {
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
    return null;
  }
}

/**
 * The styles are organized scope (global/local) > styleName > styleDef;
 *
 * @param props
 * @constructor
 */
const StyleEditorState = (props) => {
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
        if (!tagName) return;
        console.log('adding style', tagName, 'to scope', scope);
        state.do.upsertScope(scope);
        state.child(scope)?.set(tagName, 'prop: value;');
      },

      upsertScope(state: leafType, scope: string) {
        if (!state.child(scope)) {
          const def = scopeState(scope)
          state.addChild(def, scope);
          return state.child(scope)!.do.load();
        }
      },

      save(state: leafType) {
        state.children.forEach(({ child, key: scope }) => {
          child.do.save(scope);
        });
      },
      async load(state: leafType) {
        await state.do.upsertScope(id);
        await state.do.upsertScope('global');
        console.log(id, '----- styles loaded', state.$.invert());
      }
    }
  };
};

export default StyleEditorState;
