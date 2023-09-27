import {leafI, typedLeaf} from '@wonderlandlabs/forest/lib/types'

export type ConfirmDialogStateValue = {};

type leafType = typedLeaf<ConfirmDialogStateValue>;

const ConfirmDialogState = (props) => {
  const $value: ConfirmDialogStateValue = {};
  return {
    name: "ConfirmDialog",
    $value,

    selectors: {
      alpha(state: leafType) {
      }
    },

    actions: {
      init(state: leafType) {
      }
    }
  };
};

export default ConfirmDialogState;
