import {
  Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Input, Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay, Spinner
} from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { Suspense, useCallback, useEffect, useRef } from 'react'
import { useConst } from '@chakra-ui/hooks'
import { Subject } from 'rxjs'
import { GenFunction } from '@wonderlandlabs/can-di-land/lib/types'
import { MessageTypeValue } from '~/lib/managers/types'

const views = new Map();

type DialogProps = { value: { view: MessageTypeValue }, closeDialog: GenFunction }
const Dialog = ({ value, form, closeDialog }: DialogProps) => {
  console.log('dialog value:', value);
  const { view, title, onClose, onSave, cancelPrompt, actionPrompt } = value.view;
  let ViewComponent;

  console.log('----- cancelPrompt', cancelPrompt);
  /**
   * The dialogStream exists to ensure any of multiple effects
   * can have their resolution managed and interpreted at any stage.
   *
   * It is expected that it will only receive one event,
   * as the first event method should complete the dialog.
   * Completing the dialog triggers the closeDialog hook above
   * completing the message stream.
   *
   * The dialogStream shouldn't be updated directly, but through
   * the callbacks below.
   */

  const dialogStream = useConst(() => {
    const subject = new Subject();
    subject.subscribe({
      next(evt) {
        switch (evt.type) {
          case 'close':
            if (onClose) {
              onClose(evt);
            }
            break;

          case 'save':
            if (onSave) {
              onSave(evt);
            }
            break;
        }
      },
      error() {
        closeDialog();
      },
      complete() {
        closeDialog();
      }
    })
    return subject;
  });

  const cancel = useCallback((value?: any) => {
    try {
      dialogStream.next({ type: 'cancel', value });
      dialogStream.complete();
    } finally {
      if (!dialogStream.closed) {
        dialogStream.complete();
      }
    }
  }, [dialogStream]);

  const save = useCallback((value?: any) => {
    try {
      dialogStream.next({ type: 'save', value });
      dialogStream.complete();
    } finally {
      if (!dialogStream.closed) {
        dialogStream.complete();
      }
    }
  }, [dialogStream]);

  if (view) {
    if (!views.has(view)) {
      switch (view) {
        case 'help':
          views.set(view, dynamic(() => import ( '~/components/Dialogs/HelpView'), {
            suspense: true
          }))
          break;

        case 'frame-detail':
          views.set(view, dynamic(() => import ( '~/components/Dialogs/FrameDetail/FrameDetail'), {
            suspense: true
          }))
          break;
      }
    }
    ViewComponent = views.get(view);
  }

  if (!ViewComponent) {
    return null;
  }
  const size = value?.size ?? 'xl';
  if (form === 'shelf') {
    return (
      <Drawer
        isOpen
        placement='right'
        size={size}
        onClose={close}
      >
        <DrawerOverlay/>
        <DrawerContent zIndex={1000}>
          <DrawerCloseButton/>
          {title ? (<DrawerHeader>{title}</DrawerHeader>) : null}
          <DrawerBody>
            <Suspense fallback={<Spinner/>}>
              <ViewComponent value={view}
                             dialogStream={dialogStream}
                             save={save}
                             cancel={cancel}
              />
            </Suspense>
          </DrawerBody>

          <DrawerFooter>
            {
              cancelPrompt === '' ? null :
                (
                  <Button variant='outline' mr={3} onClick={cancel}>
                    {cancelPrompt || 'Cancel'}
                  </Button>
                )
            }
            <Button colorScheme='blue' onClick={save}>
              {actionPrompt || 'Save'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return <Modal isOpen
                onClose={closeDialog} size={size}
                zIndex={1000} position="absolute">
    <ModalOverlay/>
    <ModalContent zIndex={1000}>
      {title ? (<ModalHeader>{title}</ModalHeader>) : null}
      <ModalCloseButton tabIndex={-1}/>
      <ModalBody>
        <Suspense fallback={<Spinner/>}>
          <ViewComponent value={view} cancel={cancel} save={save} dialogStream={dialogStream}/>
        </Suspense>
      </ModalBody>

      <ModalFooter>
        {
          cancelPrompt === '' ? null :
            (
              <Button variant='outline' mr={3} onClick={cancel}>
                {cancelPrompt || 'Cancel'}
              </Button>
            )
        }
        <Button colorScheme='blue' mr={3} onClick={save}>
          {actionPrompt}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
}

export default Dialog
