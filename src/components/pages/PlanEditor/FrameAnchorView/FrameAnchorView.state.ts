import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type FrameAnchorViewStateValue = {};

type leafType = typedLeaf<FrameAnchorViewStateValue>;

const FrameAnchorViewState = (props) => {
  const $value: FrameAnchorViewStateValue = {};
  return {
    name: "FrameAnchorView",
    $value,

    selectors: {},

    actions: {}
  };
};

export default FrameAnchorViewState;
