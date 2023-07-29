import { Subject, SubjectLike } from 'rxjs'
import { ToastMessage } from '@chakra-ui/react'
import { ToastStatus } from '@chakra-ui/toast/dist/toast.types'
import { MessageTypeValue } from '~/lib/managers/types'
import blockManager from '~/lib/managers/blockManager'

export type MessageManager = {
  notifySubject: SubjectLike<MessageEvent>,
  send(title: string, description: string, status: ToastStatus, duration?: number, isClosable?: boolean): void,
}

const messageManager = {
  notifySubject: new Subject(),
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
    if (blockManager.isBlocked) return;
    messageManager.notifySubject.next({
      type: 'dialog',
      value: { view, title: view.title }
    })
  },

  sidebar(view) {
    if (blockManager.isBlocked) return;
    messageManager.notifySubject.next({
      type: 'shelf',
      value: { view, title: view.title }
    })
  },

  editFrame(id: string, name? : string) {
    messageManager.sidebar(
      {
        view: 'frame-detail',
        id: id,
        title: `Edit frame ${name?? id}`,
        actionPrompt: 'Save Frame',
        cancelPrompt: 'Close'
      }
    );
  },

  listFrames(id: string) {
    messageManager.sidebar(
      {
        view: 'frame-list',
        title: `Frames`,
        actionPrompt: 'Done',
        cancelPrompt: '',
        value: {size: 'sm', id}
      }
    );
  }
}

setTimeout(() => {
  messageManager.notify('Test Message', 'Test Description')
}, 1500);

export default messageManager;
