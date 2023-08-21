import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type FrameTicketStateValue = {};

type leafType = typedLeaf<FrameTicketStateValue>;

const FrameTicketState = (props) => {
  const $value: FrameTicketStateValue = {};
  return {
    name: "FrameTicket",
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

export default FrameTicketState;
