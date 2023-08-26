import { typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type InViewBlockersStateValue = {};

type leafType = typedLeaf<InViewBlockersStateValue>;

const InViewBlockersState = (props) => {
  const $value: InViewBlockersStateValue = {};
  return {
    name: "InViewBlockers",
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

export default InViewBlockersState;
