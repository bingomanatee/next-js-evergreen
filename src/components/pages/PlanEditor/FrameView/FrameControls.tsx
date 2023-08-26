import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Checkbox, HStack, IconButton, useBoolean } from '@chakra-ui/react'
import { useContext, useEffect, useState } from 'react'
import blockManager from '~/lib/managers/blockManager'
import styles from '~/components/pages/PlanEditor/FrameView/FramesView.module.scss'
import Image from 'next/image'
import messageManager from '~/lib/managers/messageManager'
import useForestFiltered from '~/lib/useForestFiltered'
import planEditorState, { planEditorMode } from '~/components/pages/PlanEditor/PlanEditor.state'
import planEditor, { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import frameListHoverManager from '~/lib/managers/frameListHoverManager'

export function FrameControls(props: {
  frameId: string, frameName: string | undefined
}) {

  const { frameId, frameName } = props;
  const planEditorState = useContext(PlanEditorStateCtx);

  const isBlocked = useForestFiltered(blockManager, (_, state) => {
    return state.$.isBlocked();
  });

  const { clicked } = useForestFiltered(frameListHoverManager, ['clicked']);

  const { zoom } = useForestFiltered(planEditorState!, ['zoom'])

  if (isBlocked) {
    return null;
  }
  return (
    <HStack
      pad={8}
      top={'20px'}
      spacing="4"
      className={styles['frame-nav-popup']}
      style={{ transform: `scale(${100 / zoom})` }}
    >
      <Checkbox layerStyle="frame-select-checkbox" isChecked={clicked === frameId} onChange={() => {
        frameListHoverManager.do.set_clicked(frameId === clicked ? null : frameId);
      }}/>
      <IconButton
        variant="frame-control-icon"
        aria-label="move"
        onClick={() => planEditorState?.do.moveFrame(frameId)}
        icon={<Image alt="edit-icon" src="/img/icons/frame-move.svg" width="30" height="30"/>}
      />
      <IconButton
        variant="frame-control-icon"
        icon={<Image alt="edit-icon" src="/img/icons/frame-edit.svg" width="30" height="30"/>}
        aria-label="edit"
        onClick={() => blockManager.do.block(planEditorMode.EDIT_FRAME, {frameId: props.frameId})}
      />
      <IconButton
        variant="frame-control-icon"
        aria-label="link"
        onClick={() => planEditorState?.do.linkFrame(frameId)}
        icon={<Image alt="edit-icon" src="/img/icons/frame-link.svg" width="30" height="30"/>}
      />

    </HStack>
  )
}
