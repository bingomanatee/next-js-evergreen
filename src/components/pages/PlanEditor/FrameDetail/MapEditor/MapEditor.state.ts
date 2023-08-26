import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type MapEditorStateValue = {};

type leafType = typedLeaf<MapEditorStateValue>;

const MapEditorState = (props) => {
  const $value: MapEditorStateValue = {};
  return {
    name: "MapEditor",
    $value,

    selectors: {},

    actions: {}
  };
};

export default MapEditorState;
