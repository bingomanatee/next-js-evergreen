"use client"
import { createContext, memo, useEffect, useRef, useState } from 'react';
import { Box2 } from 'three'
import { Box } from '@chakra-ui/react'
import { leafI } from '@wonderlandlabs/forest/lib/types'

// ----- site \
import useForest from '~/lib/useForest';
import keyManager from '~/lib/managers/keyManager'
import { GridView } from './GridView/GridView'
import { ManagerMap } from '~/lib/managers/types'

// ----- local
import HelpPrompt from './HelpPrompt/HelpPrompt'
import { KeyFeedback } from './KeyFeedback'
import MoveFrameView from './MoveFrameView/MoveFrameView'
import FramesList from './FramesView/FramesList'
import FrameAnchorView from './FrameAnchorView/FrameAnchorView'
import stateFactory, { planEditorMode } from './PlanEditor.state.ts';
import styles from './PlanEditor.module.scss';
import LinkFrameView from '~/components/pages/PlanEditor/LinkFrameView/LinkFrameView'
import blockManager from '~/lib/managers/blockManager'
import LinkView from '~/components/pages/PlanEditor/LinkView/LinkView'

type PlanEditorProps = { id: string, managers: ManagerMap }
export const PlanEditorStateCtx = createContext<leafI | null>(null);

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

function PlanEditor(props: PlanEditorProps) {
  const { id } = props;
  const planContainerRef = useRef(null);
  useEffect(() => {
    keyManager.init();
  }, [])


  const [value, state] = useForest([stateFactory, id, planContainerRef],
    async (localState) => {
      const sub = await localState.do.init();

      let keySub = keyManager.stream.subscribe((keys) => {
        localState.do.keys(keys);
      })
      return () => {
        sub?.unsubscribe()
        keySub?.unsubscribe();
      };
    });
  const [blocker, setBlocker] = useState('');

  useEffect(() => {
    const sub = blockManager.select((type) => setBlocker(type), (value) => value.type);
    return () => sub.unsubscribe();
  }, [])

  const { newFrame, frames, keys, markdownStyles } = value;

  return (<div className={styles.container} ref={planContainerRef}>
    <style dangerouslySetInnerHTML={{ __html: markdownStyles }}/>
    <PlanEditorStateCtx.Provider value={state}>
      <FrameAnchorView>
        <GridView/>
        <LinkView under />
        <FramesList frames={frames}/>
        {blocker === planEditorMode.MOVING_FRAME ? <MoveFrameView/> : null}
        {blocker === planEditorMode.LINKING_FRAME ? <LinkFrameView/> : null}
      </FrameAnchorView>
    </PlanEditorStateCtx.Provider>
    <NewFrame box={newFrame}/>
    <HelpPrompt/>
    <KeyFeedback keys={keys}/>
  </div>);
}

export default memo(PlanEditor)
