import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import messageManager from '~/lib/managers/messageManager'

export type HelpPromptStateValue = { showHelp: boolean };

type leafType = typedLeaf<HelpPromptStateValue>;

const HelpPromptState = (props) => {
  const $value: HelpPromptStateValue = { showHelp: false };
  return {
    name: "HelpPrompt",
    $value,

    selectors: {},

    actions: {
      showHelp(state: leafType) {
        state.do.set_showHelp(true);
        return messageManager.dialog({
          title: 'How To Create and Edit Frames',
          view: 'help',
          actionPrompt: 'OK',
          cancelPrompt: ''
        })
      }
    }
  };
};

export default HelpPromptState;
