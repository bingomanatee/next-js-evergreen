import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type MapStateValue = {};

type leafType = typedLeaf<MapStateValue>;

const MapState = (props) => {
  const $value: MapStateValue = {};
  return {
    name: "Map",
    $value,

    selectors: {},

    actions: {}
  };
};

export default MapState;
