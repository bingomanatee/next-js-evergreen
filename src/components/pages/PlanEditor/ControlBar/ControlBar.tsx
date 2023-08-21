import { useCallback, useContext } from 'react';
import stateFactory from './ControlBar.state.ts';
import useForest from '~/lib/useForest'
import { Box, Button, HStack, Menu, IconButton, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react'
import Image from 'next/image';
import messageManager from '~/lib/managers/messageManager'
import FrameIcon from '~/components/icons/FrameIcon'
import { frameTypeNames } from '~/constants'
import useForestFiltered from '~/lib/useForestFiltered'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import dataManager from '~/lib/managers/dataManager'

type ControlBarProps = {}

const MOVE_ICON_SIZE = 18;

export default function ControlBar(props: ControlBarProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const { newFrame } = value;
  const planEditorState = useContext(PlanEditorStateCtx);

  const listFrames = useCallback(() => {
    messageManager.listFrames();
  }, [])

  const { currentFrameId } = useForestFiltered(planEditorState!, ['currentFrameId']);

  const frame = currentFrameId ? ((id) => {
    if (!id) {
      return null;
    }
    return dataManager.planStream.value.framesMap?.get(id) || null;
  })(currentFrameId) : null;

  return (<Box layerStyle="control-bar" as="nav" data-role="control-bar" h="3em">
    <HStack justify="center" spacing={[1, 2, 3]} alignItems="center">

      <HStack spacing={0}>
        <Button
          onClick={state.do.addFrame}
          leftIcon={
            <Image
              src="/img/icons/add-frame.svg" alt="add-frame-icon"
              width={20}
              height={20}
            />}>
          Add
        </Button>
        <Menu placement="top" backgroundColor="transparent">
          <MenuButton width={'100px'} backgroundColor="transparent">
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
      </HStack>
      <Button
        onClick={listFrames}
        leftIcon={
          <Image
            src="/img/icons/frame-list.svg" alt="frame-list-icon"
            width={20}
            height={20}
          />}>
        Frames
      </Button>
      {frame ?
        <HStack ml={0} borderLeftWidth={1} py={0}
                borderColor="var(--chakra-colors-black-alpha-300)"
                pl={2} spacing={1}>
          <Text fontSize="xs" w={40} noOfLines={1}>Frame <b>{frame.name || frame.id}</b></Text>
          <IconButton
            onClick={() => dataManager.moveFrame(currentFrameId, 'top')}
            variant="pagination-button"
            icon={<Image src="/img/icons/to-top.svg"
                         width={MOVE_ICON_SIZE}
                         height={MOVE_ICON_SIZE}
                         alt="move-top-icon"/>}
            size="sm"
            aria-label="move-frame-to-top"/>
          <IconButton
            variant="pagination-button"
            onClick={() => dataManager.moveFrame(currentFrameId, 'up')}
            icon={<Image src="/img/icons/to-up.svg"
                         width={MOVE_ICON_SIZE}
                         height={MOVE_ICON_SIZE}
                         alt="move-up-icon"/>}
            size="sm"
            aria-label="move-frame-up"/>
          <IconButton
            variant="pagination-button"
            onClick={() => dataManager.moveFrame(currentFrameId, 'down')}
            icon={<Image src="/img/icons/to-down.svg"
                         width={MOVE_ICON_SIZE}
                         height={MOVE_ICON_SIZE}
                         alt="move-down-icon"/>}
            size="sm" aria-label="move-frame-down"/>
          <IconButton
            variant="pagination-button"
            onClick={() => dataManager.moveFrame(currentFrameId, 'bottom')}
            icon={<Image src="/img/icons/to-bottom.svg"
                         width={MOVE_ICON_SIZE}
                         height={MOVE_ICON_SIZE}
                         alt="move-bottom-icon"/>}
            size="sm" aria-label="move-frame-back"/>
        </HStack> : null}
    </HStack>
  </Box>);
}
