import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Checkbox, HStack, IconButton, useBoolean } from '@chakra-ui/react'
import { MouseEventHandler, useCallback, useContext, useEffect, useState } from 'react'
import blockManager from '~/lib/managers/blockManager'
import styles from '~/components/pages/PlanEditor/FrameView/FramesView.module.scss'
import Image from 'next/image'
import useForestFiltered from '~/lib/useForestFiltered'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import frameListHoverManager from '~/lib/managers/frameListHoverManager'
import { BlockMode } from '~/types'
import swallowEvent from '~/lib/swallowEvent'

export function FrameControls(props: {
  frameId: string, frameName: string | undefined
}) {

  const { frameId } = props;
  const planEditorState = useContext(PlanEditorStateCtx);

  const isBlocked = useForestFiltered(blockManager, (_, state) => {
    return state.$.isBlocked();
  });

  const { clicked } = useForestFiltered(frameListHoverManager, ['clicked']);

  const { zoom } = useForestFiltered(planEditorState!, ['zoom']);

  const editFrame = useCallback((e: MouseEvent) => {
      swallowEvent(e);
      blockManager.do.block(BlockMode.EDIT_FRAME, { frameId: props.frameId })
    },
    [props.frameId]) as MouseEventHandler<HTMLButtonElement>

  const move = useCallback((e: MouseEvent) => {
      swallowEvent(e);
      planEditorState?.do.moveFrame(frameId)
    },
    [frameId, planEditorState]) as MouseEventHandler<HTMLButtonElement>

  const linkFrame = useCallback((e) => {
      swallowEvent(e);
      planEditorState?.do.linkFrame(frameId);
    },
    [frameId, planEditorState])

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
      <Checkbox
        layerStyle="frame-select-checkbox"
        isChecked={clicked === frameId}
        onChange={() => {
          frameListHoverManager.do.set_clicked(frameId === clicked ? null : frameId);
        }}
      />
      <IconButton
        variant="frame-control-icon"
        aria-label="move"
        onClick={move}
        icon={<Image alt="move-icon" src="/img/icons/frame-move.svg" width="30" height="30"/>}
      />
      <IconButton
        variant="frame-control-icon"
        icon={<Image alt="edit-icon" src="/img/icons/frame-edit.svg" width="30" height="30"/>}
        aria-label="edit"
        onClick={editFrame}
      />
      <IconButton
        variant="frame-control-icon"
        aria-label="link"
        onClick={linkFrame}
        icon={<Image alt="link-icon" src="/img/icons/frame-link.svg" width="30" height="30"/>}
      />

    </HStack>
  )
}
