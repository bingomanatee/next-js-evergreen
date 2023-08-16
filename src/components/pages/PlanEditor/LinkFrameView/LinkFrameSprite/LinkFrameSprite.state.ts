import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type LinkFrameSpriteStateValue = {}

type leafType = typedLeaf<LinkFrameSpriteStateValue>;

const LinkFrameSpriteState = (props) => {
  const $value: LinkFrameSpriteStateValue = {};
  return {
    name: "LinkFrameSprite",
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

export default LinkFrameSpriteState;
