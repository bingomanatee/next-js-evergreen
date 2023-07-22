import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type ImageStateValue = {};

type leafType = typedLeaf<ImageStateValue>;

const ImageState = (props) => {
  const $value: ImageStateValue = {};
  return {
    name: "Image",
    $value,

    selectors: {},

    actions: {}
  };
};

export default ImageState;
