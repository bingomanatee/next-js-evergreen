import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type LayerViewStateValue = {};

type leafType = typedLeaf<LayerViewStateValue>;

const LayerViewState = (props) => {
  const $value: LayerViewStateValue = {};
  return {
    name: "LayerView",
    $value,

    selectors: {},

    actions: {}
  };
};

export default LayerViewState;
