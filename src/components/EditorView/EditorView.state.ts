import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type EditorViewStateValue = {};

type leafType = typedLeaf<EditorViewStateValue>;

const EditorViewState = (props) => {
  const $value: EditorViewStateValue = {};
  return {
    name: "EditorView",
    $value,

    selectors: {},

    actions: {}
  };
};

export default EditorViewState;
