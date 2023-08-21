import { Subject, SubjectLike } from 'rxjs'
import { ToastMessage } from '@chakra-ui/react'
import { ToastStatus } from '@chakra-ui/toast/dist/toast.types'
import { MessageTypeValue } from '~/lib/managers/types'
import blockManager from '~/lib/managers/blockManager'
import dataManager from '~/lib/managers/dataManager'
import frameListHoverManager from '~/lib/managers/frameListHoverManager'
import dialogState from '~/components/Dialogs/Dialog.state'

export type MessageManager = {
  notifySubject: SubjectLike<MessageEvent>,
  send(title: string,
       description: string,
       status: ToastStatus,
       duration?: number,
       isClosable?: boolean): void,
}

const messageManager = {
  notifySubject: new Subject(), // triggers dialogs, sidebars, and notifications.
  notify(title,
         description,
         status = 'success',
         duration = 2000,
         isClosable = true) {
    messageManager.notifySubject.next(
      {
        type: 'toast',
        value:
          {
            title,
            description,
            status,
            duration,
            isClosable,
            icon: <span></span>
          }
      }
    )
  },
  async dialog(view: MessageTypeValue) {
    if (blockManager.$.isBlocked()) {
      return;
    }
    messageManager.notifySubject.next({
      type: 'dialog',
      value: { view, title: view.title }
    })
  },

  sidebar(view) {
    if (blockManager.$.isBlocked()) {
      return;
    }
    messageManager.notifySubject.next({
      type: 'shelf',
      value: { view, title: view.title }
    })
  },

  async editFrame(id: string, name?: string) {
    const frame = await dataManager.do((db) => db.frames.fetch(id));
    if (!frame) {
      console.error('cannot edit/find frame ', id);
      return;
    }
    messageManager.sidebar(
      {
        view: 'frame-detail',
        id: id,
        title: `Edit frame ${frame.name ?? id}`,
        actionPrompt: 'Save Frame',
        cancelPrompt: 'Close'
      }
    );
  },

  listFrames(id?: string) {
    console.log('---- listFrames');
    frameListHoverManager.do.set_clicked(id || null);
    const sub = messageManager.notifySubject.subscribe((value) => {
      if (value.type === 'close-dialog') {
        frameListHoverManager.do.clear();
        sub.unsubscribe();
      }
    })
    messageManager.sidebar(
      {
        view: 'frame-list',
        title: `Frames`,
        actionPrompt: 'Done',
        cancelPrompt: 'Close',
        value: { size: ['md', 'md', 'lg'], id: id | null }
      }
    );
  }
}

setTimeout(() => {
  messageManager.notify('Test Message', 'Test Description')
}, 1500);

export default messageManager;
