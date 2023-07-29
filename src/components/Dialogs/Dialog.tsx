import { useState, useEffect, useCallback, Suspense } from 'react';
import styles from './Dialog.module.scss';
import stateFactory from './Dialog.state.ts';
import useForest from '~/lib/useForest';
import { MessageTypeValue } from '~/lib/managers/types'
import { GenFunction } from '@wonderlandlabs/can-di-land/lib/types'
import dynamic from 'next/dynamic'
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent, DrawerFooter,
  DrawerHeader,
  DrawerOverlay, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  Spinner
} from '@chakra-ui/react'
import DialogStateCtx from '~/components/Dialogs/DialogStateCtx'

type DialogProps = { value: { view: MessageTypeValue }, closeDialog: GenFunction }

const views = new Map();
export default function Dialog(props: DialogProps) {
  const { form, closeDialog } = props;
  const { view, title, value } = props.value.view;

  let ViewComponent;

  const [stateValue, state] = useForest([stateFactory, props],
    (localState) => {
      localState.do.init();
    });

  const { buttons } = stateValue;

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

        case 'frame-list':
          views.set(view, dynamic(() => import ( '~/components/Dialogs/FrameList/FrameList'), {
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
      <DialogStateCtx.Provider value={state}>
        <Drawer
          isOpen
          autoFocus={false}
          placement='right'
          size={size}
          onClose={closeDialog}
        >
          <DrawerOverlay/>
          <DrawerContent zIndex={1000}>
            <DrawerCloseButton tabIndex={-1}/>
            {title ? (<DrawerHeader>{title}</DrawerHeader>) : null}
            <Suspense fallback={<Spinner/>}>
              <ViewComponent
                value={props.value.view}
                cancel={state.do.cancel}
                save={state.do.save}
              />
            </Suspense>
          </DrawerContent>
        </Drawer>
      </DialogStateCtx.Provider>
    )
  }

  return <Modal isOpen
                autoFocus={false}
                onClose={closeDialog} size={size}
                zIndex={1000} position="absolute">
    <ModalOverlay/>
    <ModalContent zIndex={1000}>
      {title ? (<ModalHeader>{title}</ModalHeader>) : null}
      <ModalCloseButton tabIndex={-1}/>
      <ModalBody>
        <Suspense fallback={<Spinner/>}>
          <ViewComponent
            value={props.value.view}
            cancel={state.do.cancel}
            save={state.do.save}
          />
        </Suspense>
      </ModalBody>

      <ModalFooter>
        {
          buttons.map((buttonDef) => {
            const { onClick, key, label, ...rest } = buttonDef;
            return <Button mr={3} key={key} onClick={onClick} {...rest}>{label}</Button>
          })
        }
      </ModalFooter>
    </ModalContent>
  </Modal>
}
