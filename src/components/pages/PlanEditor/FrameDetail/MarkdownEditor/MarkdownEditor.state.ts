import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type MarkdownEditorStateValue = {};

type leafType = typedLeaf<MarkdownEditorStateValue>;

const MarkdownEditorState = (props) => {
  const $value: MarkdownEditorStateValue = {};
  return {
    name: "MarkdownEditor",
    $value,

    selectors: {},

    actions: {}
  };
};

export default MarkdownEditorState;
