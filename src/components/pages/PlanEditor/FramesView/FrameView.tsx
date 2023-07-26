import { Frame } from '~/types'
import { useCallback, useEffect, useRef } from 'react'
import messageManager from '~/lib/managers/messageManager'
import { Box, Heading, HStack, IconButton, Text, useBoolean } from '@chakra-ui/react'
import px from '~/lib/utils/px'
import dynamic from 'next/dynamic'
import Image from 'next/image';
import styles from './FramesView.module.scss'

const resourceMap = new Map();

function NullView({ frame: frame }) {
  return (<Box>
    <Heading size="xs">
      untyped frame {frame.name ?? frame.id}
    </Heading>
  </Box>)
}

export function FrameView(props: { frame: Frame }) {
  const { frame } = props;
  const boxRef = useRef(null);
  /**
   * edit on click handler
   */
  const onEditClick= useCallback(() => {
    messageManager.sidebar(
      {
        view: 'frame-detail',
        id: frame.id,
        title: `Edit frame ${frame.name ?? frame.id}`,
        actionPrompt: 'Save Frame',
        cancelPrompt: 'Close'
      }
    );
  }, [frame])
  const onListClick = useCallback(() => {
    messageManager.sidebar(
      {
        view: 'frame-list',
        title: `Frames`,
        actionPrompt: 'Done',
        cancelPrompt: ''
      }
    );
  }, [])

  let DetailView;
  if (frame.type) {
    switch (frame.type) {
      case 'markdown':
        if (!resourceMap.has(frame.type)) {
          resourceMap.set(frame.type, dynamic(() => import ( './Markdown/Markdown')))
        }
        break;

      case 'map':
        if (!resourceMap.has(frame.type)) {
          resourceMap.set(frame.type, dynamic(() => import ( './Map/Map')))
        }

      case 'image':
        if (!resourceMap.has(frame.type)) {
          resourceMap.set(frame.type, dynamic(() => import ( './Image/Image')))
        }
        break;
    }
  }

  DetailView = resourceMap.get(frame.type ?? null) || NullView
  return (
    <Box
      as="section"
      ref={boxRef}
      left={px(frame.left)}
      top={px(frame.top)}
      width={px(frame.width)}
      height={px(frame.height)}
      layerStyle="frameView"
      zIndex={frame.order}
      className={styles['frame-view']}
    >
      <HStack pad={8} spacing="4" position="absolute" className={styles['frame-nav-popup']}>
        <IconButton
          aria-label="move"
          p={2}
          w="36px" h="36px"
          border="1px solid black"
          borderColor="blackAlpha.500"
          icon={<Image alt="edit-icon" src="/img/icons/frame-move.svg" width="30" height="30"/>}
          backgroundColor="white" isRound
        />
        <IconButton
          onClick={onEditClick}
          ml={4}
          p={2}
          w="36px" h="36px"
          aria-label="edit"
          border="1px solid black"
          borderColor="blackAlpha.500"
          icon={<Image alt="edit-icon" src="/img/icons/frame-edit.svg" width="30" height="30"/>}
          backgroundColor="white" isRound
        />
        <IconButton
          onClick={onListClick}
          ml={4}
          p={2}
          w="36px" h="36px"
          aria-label="edit"
          border="1px solid black"
          borderColor="blackAlpha.500"
          icon={<Image alt="edit-icon" src="/img/icons/frame-list.svg" width="30" height="30"/>}
          backgroundColor="white" isRound
        />
      </HStack>
      <Box as="div" layerStyle="frameDetailWrapper" data-id="frame-detail-wrapper">
        <DetailView frame={frame}/>
      </Box>
    </Box>
  )
}
