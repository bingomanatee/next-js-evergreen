import { leafI } from '@wonderlandlabs/forest/lib/types'
import { HStack, IconButton, useBoolean } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import blockManager from '~/lib/managers/blockManager'
import styles from '~/components/pages/PlanEditor/FramesView/FramesView.module.scss'
import Image from 'next/image'
import messageManager from '~/lib/managers/messageManager'
import useForestFiltered from '~/lib/useForestFiltered'

export function FrameControls(props: {
  planEditorState: leafI, frameId: string, frameName: string | undefined
}) {

  const { planEditorState, frameId, frameName } = props;

  const isBlocked = useForestFiltered(blockManager, (_, state) => {
    return state.$.isBlocked();
  })

  if (isBlocked) {
    return null;
  }
  return (
    <HStack pad={8}
            top={'20px'}
            spacing="4"
            className={styles['frame-nav-popup']}>
      <IconButton
        aria-label="move"
        onClick={() => planEditorState?.do.moveFrame(frameId)}
        p={2}
        w="36px" h="36px"
        border="1px solid black"
        borderColor="blackAlpha.500"
        icon={<Image alt="edit-icon" src="/img/icons/frame-move.svg" width="30" height="30"/>}
        backgroundColor="white" isRound
      />
      <IconButton
        aria-label="edit"
        onClick={() => messageManager.editFrame(frameId, frameName)}
        ml={4}
        p={2}
        w="36px" h="36px"
        border="1px solid black"
        borderColor="blackAlpha.500"
        icon={<Image alt="edit-icon" src="/img/icons/frame-edit.svg" width="30" height="30"/>}
        backgroundColor="white" isRound
      />
      <IconButton
        aria-label="list"
        onClick={() => messageManager.listFrames(frameId)}
        ml={4}
        p={2}
        w="36px" h="36px"
        border="1px solid black"
        borderColor="blackAlpha.500"
        icon={<Image alt="edit-icon" src="/img/icons/frame-list.svg" width="30" height="30"/>}
        backgroundColor="white" isRound
      />
    </HStack>
  )
}
