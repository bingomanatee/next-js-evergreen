import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'

export type LinkFrameSpriteStateValue = {}

type leafType = typedLeaf<LinkFrameSpriteStateValue>;

const LinkFrameSpriteState = (props, linkState) => {
  const {dir, isEnd} = props;

  const $value: LinkFrameSpriteStateValue = {};
  return {
    name: "LinkFrameSprite",
    $value,

    selectors: {
    },

    actions: {
      init(state: leafType) {
      },
      onClick() {
        if (isEnd) return linkState.child('target')!.do.spriteClicked(dir);
        linkState.do.spriteClicked(dir);
      }
    }
  };
};

export default LinkFrameSpriteState;
