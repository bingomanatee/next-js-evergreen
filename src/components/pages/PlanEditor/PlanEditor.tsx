"use client"
import { useState, useEffect, useContext, memo, useRef } from 'react';
import styles from './PlanEditor.module.scss';
import stateFactory from './PlanEditor.state.ts';
import useForest from '~/lib/useForest';
import keyManager from '~/lib/managers/keyManager'
import FrameAnchorView from '~/components/pages/PlanEditor/FrameAnchorView/FrameAnchorView'
import FramesView from '~/components/pages/PlanEditor/FramesView/FramesView'
import { GridView } from '~/components/pages/PlanEditor/GridView/GridView'
import { ManagerMap } from '~/lib/managers/types'
import { Box2 } from 'three'
import { Box, Flex, VStack, Text, Kbd } from '@chakra-ui/react'
import HelpPrompt from '~/components/pages/PlanEditor/HelpPrompt/HelpPrompt'

type PlanEditorProps = { id: string, managers: ManagerMap }

function NewFrame(props: { box: Box2 | null }) {
  const { box } = props;
  if (!box) {
    return null
  }

  return <Box
    layerStyle="newFrame"
    left={box.min.x + 'px'}
    width={Math.round(box.max.x - box.min.x) + 'px'}
    height={Math.round(box.max.y - box.min.y) + 'px'}
    top={box.min.y + 'px'}
  >New Frame</Box>
}

function KeyFeedbackItem(props: { value: string }) {
  switch (props.value) {
    case ('f'):
      return <Flex direction="row" layerStyle="keyHintRow">
        <Kbd>F</Kbd>
        <Text textStyle="keyHint" size="sm">Draw a frame with a mouse drag</Text>
      </Flex>
      break;
  }
  return null;
}

const KeyFeedbackItemM = memo(KeyFeedbackItem);

function KeyFeedback({ keys }) {
  const keyValues = Array.from(keys);
  if (!keyValues.length) {
    return null;
  }
  return <section className={styles['key-feedback']}>
    <VStack>
      {keyValues.map((key: string) => (<KeyFeedbackItemM key={key} value={key}/>))}
    </VStack>
  </section>
}

function PlanEditor(props: PlanEditorProps) {
  const { id } = props;
  const planContainerRef = useRef(null);

  const [value, state] = useForest([stateFactory, id, planContainerRef],
    async (localState) => {
      const sub = await localState.do.load();
      keyManager.init();

      let keySub = keyManager.stream.subscribe((keys) => {
        localState.do.set_keys(keys);
      })
      return () => {
        sub?.unsubscribe()
        keySub?.unsubscribe();
      };
    }, 'PLAN EDITOR ');

  const { newFrame, frames, keys, markdownStyles } = value;

  return (<div className={styles.container} ref={planContainerRef}>
    <style dangerouslySetInnerHTML={{ __html: markdownStyles }}/>
    <FrameAnchorView>
      <GridView/>
      <FramesView frames={frames}/>
    </FrameAnchorView>
    <NewFrame box={newFrame}/>
    <HelpPrompt/>
    <KeyFeedback keys={keys}/>
  </div>);
}

export default memo(PlanEditor)
