"use client"
import { useState, useEffect, useContext, memo, useRef } from 'react';
import styles from './PlanEditor.module.scss';
import stateFactory from './PlanEditor.state.ts';
import useForest from '~/lib/useForest';
/*
import ManagerContext from '~/components/managers/ManagerContext'*/
import EditorView from '~/components/EditorView/EditorView'
import FrameAnchorView from '~/components/pages/PlanEditor/FrameAnchorView/FrameAnchorView'
import FramesView from '~/components/pages/PlanEditor/FramesView/FramesView'
import { GridView } from '~/components/pages/PlanEditor/GridView/GridView'
import { ManagerMap } from '~/lib/managers/types'
import useForestFiltered from '~/lib/useForestFiltered'
import { Box2 } from 'three'
import { Box } from '@chakra-ui/react'

type PlanEditorProps = { id: string, managers: ManagerMap }

function NewFrame(props: { box: Box2 | null }) {
  const {box} = props;
  if (!box) return null

  return <Box position="absolute"
              background="black" color="white"
              left={box.min.x + 'px'}
              overflow="hidden"
              width={Math.round(box.max.x - box.min.x) + 'px'}
              height={Math.round(box.max.y - box.min.y) + 'px'}
              top={box.min.y + 'px'}
              pad={2}>New Frame</Box>
}

function PlanEditor(props: PlanEditorProps) {
  const { id } = props;
  const planContainerRef = useRef(null);

  const [value, state] = useForest([stateFactory, id, planContainerRef],
    (localState) => {
      console.log('create - local state')
      localState.do.load();
      console.log('create - local state loaded')
    }, 'PLAN EDITOR ');

  const {newFrame} = value;

  console.log('newFrame:', newFrame);
  return (<div className={styles.container} ref={planContainerRef}>
    <EditorView/>
    <FrameAnchorView>
      <GridView/>
      <FramesView/>
    </FrameAnchorView>
    <NewFrame box={newFrame} />
  </div>);
}

export default memo(PlanEditor)
