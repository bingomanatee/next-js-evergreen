import { useState, useEffect, useCallback } from 'react';
import styles from './FramesView.module.scss';
import stateFactory from './FramesView.state.ts';
import useForest from '~/lib/useForest';
import { Frame } from '~/types'
import { Box, Text } from '@chakra-ui/react'

type FramesViewProps = { frames: Frame[] }

function px(n: number) {
  if (!(n && (typeof n === 'number'))) {
    return 0;
  }
  return `${Math.round(n)}px`
}

function FrameView(props: { frame: Frame }) {
  const { frame } = props;
  return (
    <Box left={px(frame.left)}
         top={px(frame.top)}
         overfloe="hidden"
         position="absolute"
         backgronundColor="lightGrey">
      <Text size="sm">{frame.id}</Text>
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
