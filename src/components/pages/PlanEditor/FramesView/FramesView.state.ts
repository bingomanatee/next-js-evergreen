import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type FramesViewStateValue = {};

type leafType = typedLeaf<FramesViewStateValue>;

const FramesViewState = (props) => {
  const $value: FramesViewStateValue = {};
  return {
    name: "FramesView",
    $value,

    selectors: {},

    actions: {}
  };
};

export default FramesViewState;
