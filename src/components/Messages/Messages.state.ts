import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import messageManager from '~/lib/managers/messageManager'
import { useCallback, useEffect } from 'react'

export type MessagesStateValue = {
  shelf: Record<string, any> | null,
  dialog: Record<string, any> | null
};

type leafType = typedLeaf<MessagesStateValue>;

const MessagesState = (props, toast) => {
  const $value: MessagesStateValue = { dialog: null, shelf: null };
  return {
    name: "Messages",
    $value,

    selectors: {},

    actions: {
      onMessage(state, message) {
        const { type, value } = message;
        switch (type) {
          case 'dialog':
            state.do.set_dialog(value);
            state.do.set_shelf(null);
            break;

          case 'shelf':
            state.do.set_dialog(null);
            state.do.set_shelf(value);
            break;

          case 'toast':
            toast(value);
            break;
        }
      },

      closeDialog(state: leafType) {
        state.do.set_dialog(null);
      },

      closeShelf(state: leafType) {
        state.do.set_shelf(null);
      },

      load(state: leafType) {
        let sub = messageManager.notifySubject.subscribe(state.do.onMessage);
        return () => sub?.unsubscribe()
      }
    }
  };
};

export default MessagesState;
