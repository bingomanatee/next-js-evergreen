import { MouseEventHandler, useCallback, useContext, useMemo } from 'react';
import stateFactory from './ControlBar.state.ts';
import useForest from '~/lib/useForest';
import styles from './ControlBar.module.scss';
import { GrClear } from 'react-icons/gr';

import {
  Box,
  Button,
  CloseButton,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Portal,
  Kbd
} from '@chakra-ui/react'
import Image from 'next/image';
import messageManager from '~/lib/managers/messageManager'
import FrameIcon from '~/components/icons/FrameIcon'
import { frameTypeNames } from '~/constants'
import useForestFiltered from '~/lib/useForestFiltered'
import dataManager from '~/lib/managers/dataManager'
import { ShufflePos } from '~/lib/utils/frameMover'
import stopPropagation from '~/lib/utils/stopPropagation'
import frameListHoverManager from '~/lib/managers/frameListHoverManager'
import { ZoomControl } from '~/components/pages/PlanEditor/ControlBar/ZoomControl'
import { createPortal } from 'react-dom'
import { vectorToStyle } from '~/lib/utils/px'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import blockManager from '~/lib/managers/blockManager'
import { BlockMode } from '~/types'
import swallowEvent from '~/lib/swallowEvent'

type ControlBarProps = {}

const MOVE_ICON_SIZE = 18;

function Panner({ state, panPosition }) {
  const pos = vectorToStyle(panPosition);
  return (<div className={styles['pan-context']}
  >
    <section style={pos}
    >
      <Image ref={state.do.onPanImage} src="/img/icons/page-move.svg" alt="panner" style={{
        width: '80px', height: '80px',
      }}
             width="20" height="20"/>
    </section>
  </div>)
}

function FrameControlBar({ frame }) {
  const { clicked } = useForestFiltered(frameListHoverManager!, ['clicked']);
  const editFrame = useCallback((e: MouseEvent) => {
      swallowEvent(e);
      blockManager.do.block(BlockMode.EDIT_FRAME, { frameId: frame.id })
    },
    [frame.id]) as MouseEventHandler<HTMLButtonElement>

  const planEditorState = useContext(PlanEditorStateCtx);

  const move = useCallback((e: MouseEvent) => {
      swallowEvent(e);
      blockManager.do.block(BlockMode.EDIT_FRAME, { frameId: frame.id });
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

function PanControl({ state }) {
  const { panning } = useForestFiltered(state, ['panning'])
  return <Button
    size="sm"
    onClick={state.do.pan}
    leftIcon={
      <Image
        width={20}
        height={20}
        alt="pan-icon"
        src="/img/icons/page-move.svg"/>
    }>
    <Text size="xs">Pan</Text>
    {panning ? (<Text textStyle="info-sm"><Kbd>Esc</Kbd> to cancel</Text>) : null}
  </Button>
}

export default function ControlBar(props: ControlBarProps) {
  const planEditorState = useContext(PlanEditorStateCtx);
  const [value, state] = useForest([stateFactory, props, planEditorState],
    (localState) => {
    });

  const { newFrame, panning, panPosition } = value;

  const listFrames = useCallback(() => {
    messageManager.listFrames();
  }, [])

  const { clicked } = useForestFiltered(frameListHoverManager!, ['clicked']);

  const frame = useMemo(() => {
    return clicked ? dataManager.planStream.value.framesMap?.get(clicked) : null
  }, [clicked]);

  return (
    <Box
      layerStyle="control-bar"
      as="nav"
      data-role="control-bar"
      h="3em"
      onMouseDown={stopPropagation}
    >
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
              <MenuButton width={'36px'} backgroundColor="blackAlpha.100" px={2}>
                <HStack>
                  <FrameIcon active={true} type={newFrame.type} size={16}/>
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
            onClick={() => blockManager.do.block(BlockMode.LIST_FRAMES)}
            leftIcon={
              <Image
                src="/img/icons/frame-list.svg" alt="frame-list-icon"
                width={20}
                height={20}
              />}>
            Frames
          </Button>

          <ZoomControl state={state}/>
          <PanControl state={state}/>
          <IconButton size="sm" onClick={planEditorState.do.clearTransform}
                      variant="controlIcon"
                      aria-label="reset" icon={
            <GrClear/>
          }/>
        </HStack>
        {frame ? <FrameControlBar frame={frame}/> : null}
      </HStack>
      {
        panning ? <Portal><Panner state={state} panPosition={panPosition}/></Portal> : null
      }
    </Box>
  );
}
