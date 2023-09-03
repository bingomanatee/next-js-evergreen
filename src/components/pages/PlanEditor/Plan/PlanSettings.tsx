import { useState, useEffect, useCallback } from 'react';
import styles from './PlanSettings.module.scss';
import stateFactory from './PlanSettings.state.ts';
import useForest from '~/lib/useForest'
import blockManager from '~/lib/managers/blockManager'
import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay } from '@chakra-ui/react'

type PlanSettingsProps = {}

export default function PlanSettings(props: PlanSettingsProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const {} = value;

  return (
    <Drawer
      isOpen
      autoFocus={false}
      placement='right'
      size={['sm', 'md', 'md']}
      onClose={blockManager.do.finish}
    >
      <DrawerOverlay/>
      <DrawerContent zIndex={1000}>
        <DrawerCloseButton/>
        <DrawerHeader>Project Settings</DrawerHeader>
        <DrawerBody>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
