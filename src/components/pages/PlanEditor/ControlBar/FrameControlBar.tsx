import useForestFiltered from '~/lib/useForestFiltered'
import frameListHoverManager from '~/lib/managers/frameListHoverManager'
import { MouseEventHandler, useCallback, useContext } from 'react'
import swallowEvent from '~/lib/swallowEvent'
import blockManager from '~/lib/managers/blockManager'
import { BlockMode } from '~/types'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import { CloseButton, HStack, IconButton, Text } from '@chakra-ui/react'
import Image from 'next/image'
import dataManager from '~/lib/managers/dataManager'
import { ShufflePos } from '~/lib/utils/frameMover'

const MOVE_ICON_SIZE = 18;

export function FrameControlBar({ frame }) {
  const { clicked } = useForestFiltered(frameListHoverManager!, ['clicked']);
  const editFrame = useCallback((e: MouseEvent) => {
      swallowEvent(e);
      blockManager.do.block(BlockMode.EDIT_FRAME, { frameId: frame.id })
    },
    [frame.id]) as MouseEventHandler<HTMLButtonElement>

  const planEditorState = useContext(PlanEditorStateCtx);

  const move = useCallback((e: MouseEvent) => {
      swallowEvent(e);
      blockManager.do.block(BlockMode.MOVING_FRAME, { frameId: frame.id });
    },
    [frame.id]) as MouseEventHandler<HTMLButtonElement>

  const linkFrame = useCallback((e) => {
      swallowEvent(e);
      blockManager.do.block(BlockMode.LINKING_FRAME, { frameId: frame.id });
    },
    [frame.id, planEditorState])
  return (<HStack
      ml={0} py={0}
      borderColor="var(--chakra-colors-black-alpha-300)"
      pl={2}
      spacing={[1, 2, 2]}
    >
      <Text
        fontSize="xs"
        w={40}
        noOfLines={1}>
        Frame&nbsp;
        <b>{frame.name || frame.id}</b>
      </Text>
      <CloseButton
        mr={4}
        color="red"
        size="xs"
        onClick={frameListHoverManager.do.clearClicked}
      />
      <IconButton
        variant="pagination-button"
        onClick={editFrame}
        aria-label={"edit-icon"}
        icon={<Image alt="edit-icon" src="/img/icons/frame-edit.svg" width="20" height="20"/>}
      />
      <IconButton
        onClick={() => dataManager.moveFrame(clicked, ShufflePos.top0)}
        variant="pagination-button"
        icon={<Image src="/img/icons/to-top.svg"
                     width={MOVE_ICON_SIZE}
                     height={MOVE_ICON_SIZE}
                     alt="move-top-icon"/>}
        size="sm"
        aria-label="move-frame-to-top"/>
      <IconButton
        variant="pagination-button"
        onClick={() => dataManager.moveFrame(clicked, ShufflePos.before2)}
        icon={<Image src="/img/icons/to-up.svg"
                     width={MOVE_ICON_SIZE}
                     height={MOVE_ICON_SIZE}
                     alt="move-up-icon"/>}
        size="sm"
        aria-label="move-frame-up"/>
      <IconButton
        variant="pagination-button"
        onClick={() => dataManager.moveFrame(clicked, ShufflePos.after4)}
        icon={<Image src="/img/icons/to-down.svg"
                     width={MOVE_ICON_SIZE}
                     height={MOVE_ICON_SIZE}
                     alt="move-down-icon"/>}
        size="sm" aria-label="move-frame-down"/>
      <IconButton
        variant="pagination-button"
        onClick={() => dataManager.moveFrame(clicked, ShufflePos.bottom6)}
        icon={<Image src="/img/icons/to-bottom.svg"
                     width={MOVE_ICON_SIZE}
                     height={MOVE_ICON_SIZE}
                     alt="move-bottom-icon"/>}
        size="sm"
        aria-label="move-frame-back"/>
      <IconButton
        variant="pagination-button"
        onClick={move}
        aria-label={"move-icon"}
        icon={<Image alt="move-icon" src="/img/icons/frame-move.svg" width="20" height="20"/>}
      />
      <IconButton
        variant="pagination-button"
        onClick={linkFrame}
        aria-label={"link-icon"}
        icon={<Image alt="move-icon" src="/img/icons/frame-link.svg" width="20" height="20"/>}
      />
    </HStack>

  )
}
