import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './FramesView.module.scss';
import stateFactory from './FramesView.state.ts';
import useForest from '~/lib/useForest';
import { Frame } from '~/types'
import { Box, Text } from '@chakra-ui/react'
import messages from '~/components/Messages'
import messageManager from '~/lib/managers/messageManager'

type FramesViewProps = { frames: Frame[] }

function px(n: number) {
  if (!(n && (typeof n === 'number'))) {
    return 0;
  }
  return `${Math.round(n)}px`
}

function FrameView(props: { frame: Frame }) {
  const { frame } = props;
  const boxRef = useRef(null);

  useEffect(() => {
    boxRef.current?.addEventListener('mouseclick', () => {
      messageManager.sidebar(<EditFrame id={frame.id}/>)
    })
  }, [])
  return (
    <Box
      ref={boxRef}
      left={px(frame.left)}
      top={px(frame.top)}
      width={px(frame.width)}
      height={px(frame.height)}
      overflow="hidden"
      position="absolute"
      border="1px solid black"
      borderColor="gray.300"
      paddingX={2}
      paddingY={1}
      zIndex={frame.order}
      backgroundColor="white">
      <Text fontSize="xs">{frame.id}</Text>
    </Box>
  )
}

export default function FramesView(props: FramesViewProps) {
  const { frames } = props;
  /*  const [value, state] = useForest([stateFactory, props],
      (localState) => {
      });

    const {} = value;*/

  return (<div className={styles.container}>
    {frames.map((frame) => (<FrameView key={frame.id} frame={frame}/>))}
  </div>);
}
