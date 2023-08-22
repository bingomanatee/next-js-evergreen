import { useCallback, useContext, useMemo } from 'react';
import stateFactory from './ControlBar.state.ts';
import useForest from '~/lib/useForest'
import {
  Box,
  Button,
  CloseButton,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Flex,
} from '@chakra-ui/react'
import Image from 'next/image';
import messageManager from '~/lib/managers/messageManager'
import FrameIcon from '~/components/icons/FrameIcon'
import { frameTypeNames } from '~/constants'
import useForestFiltered from '~/lib/useForestFiltered'
import planEditor, { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import dataManager from '~/lib/managers/dataManager'
import { ShufflePos } from '~/lib/utils/frameMover'
import stopPropagation from '~/lib/utils/stopPropagation'
import frameListHoverManager from '~/lib/managers/frameListHoverManager'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'

type ControlBarProps = {}

const MOVE_ICON_SIZE = 18;

function percent(n) {
  return Math.round(100 * n) + '%'
}

function ZoomControl() {
  const planEditorState = useContext(PlanEditorStateCtx);
  const { zoom } = useForestFiltered(planEditorState!, ['zoom']);

  return (
    <HStack>
      <Text textStyle="info-sm" size="xs">Zoom</Text>
      <IconButton
        size="sm"
        background="white"
        aria-label="zoomIn"
        icon={<ChevronLeftIcon/>}
        onClick={planEditorState.do.zoomIn}
      />
      <Text size="xs">
        {percent(zoom)}
      </Text>
      <IconButton
        size="sm"
        background="white"
        aria-label="zoomOut"
        onClick={planEditorState.do.zoomOut}
        icon={<ChevronRightIcon/>}/>
    </HStack>
  )

}

export default function ControlBar(props: ControlBarProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const { newFrame } = value;

  const listFrames = useCallback(() => {
    messageManager.listFrames();
  }, [])

  const { clicked } = useForestFiltered(frameListHoverManager!, ['clicked']);

  const frame = useMemo(() => clicked ? dataManager.planStream.value.framesMap?.get(clicked) : null, [clicked]);

  return (
    <Box
      layerStyle="control-bar"
      as="nav"
      data-role="control-bar"
      h="3em"
      onMouseDown={stopPropagation}>
      <HStack justify="space-between" spacing={[1, 2, 3]} alignItems="center">

        <HStack spacing={2}>
          <Flex>
            <Button
              onClick={state.do.addFrame}
              background="white"
              leftIcon={
                <Image
                  src="/img/icons/add-frame.svg" alt="add-frame-icon"
                  width={20}
                  height={20}
                />}>
              Add
            </Button>
            <Menu placement="top">
              <MenuButton width={'100px'} backgroundColor="blackAlpha.100" px={2}>
                <HStack>
                  <FrameIcon active={true} type={newFrame.type} size={16}/>
                  <Text>{newFrame.type}</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                {frameTypeNames.map((fType) => {
                  return <MenuItem
                    onClick={() => state.child('newFrame')!.do.set_type(fType)}
                    key={fType}
                    icon={<FrameIcon
                      active={fType === newFrame.type}
                      size={16}
                      type={fType}
                    />}>
                    {fType}
                  </MenuItem>
                })}
              </MenuList>
            </Menu>
          </Flex>
          <Button
            onClick={listFrames}
            background="white"
            leftIcon={
              <Image
                src="/img/icons/frame-list.svg" alt="frame-list-icon"
                width={20}
                height={20}
              />}>
            Frames
          </Button>

          <ZoomControl/>
        </HStack>
        {frame ?
          <HStack
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
              size="sm" aria-label="move-frame-back"/>
          </HStack> : null}
      </HStack>
    </Box>);
}
