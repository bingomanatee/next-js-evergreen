import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type MoveFrameViewStateValue = {};

type leafType = typedLeaf<MoveFrameViewStateValue>;

const MoveFrameViewState = (props) => {
  const $value: MoveFrameViewStateValue = {};
  return {
    name: "MoveFrameView",
    $value,

    selectors: {},

    actions: {}
  };
};

export default MoveFrameViewState;
