import { Subject, SubjectLike } from 'rxjs'
import { ToastMessage } from '@chakra-ui/react'
import { ToastStatus } from '@chakra-ui/toast/dist/toast.types'
import Manager from '~/lib/managers/Manager'

export type MessageManager = {
  subject: SubjectLike<ToastMessage>,
  send(title: string, description: string, status: ToastStatus, duration?: number, isClosable?: boolean): void,
}

export default function messageManager() {

  const stream = {
    notifySubject: new Subject(),
    notify(title,
           description,
           status = 'success',
           duration = 2000,
           isClosable = true) {
      stream.notifySubject.next({
        title, description, status, duration,
 isClosable,
        icon: <span></span>
      })
    },
   async dialog() {
     // @TODO
    }
  }

  setTimeout(() => {
    stream.notify('Test Message', 'Test Description')
  }, 500);

  return stream;
}
