import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type ImageEditorStateValue = {};

type leafType = typedLeaf<ImageEditorStateValue>;

const ImageEditorState = (props) => {
  const $value: ImageEditorStateValue = {};
  return {
    name: "ImageEditor",
    $value,

    selectors: {},

    actions: {}
  };
};

export default ImageEditorState;
